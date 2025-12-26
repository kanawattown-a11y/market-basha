import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { ticketSchema } from '@/lib/validations';
import { createAuditLog } from '@/lib/audit';
import { generateTicketNumber } from '@/lib/utils';
import { sendPushToRole } from '@/lib/notifications';

// GET /api/tickets - Get tickets
export async function GET(request: NextRequest) {
    try {
        const user = await getSession();

        if (!user) {
            return NextResponse.json(
                { message: 'يجب تسجيل الدخول' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const status = searchParams.get('status');

        const where: Record<string, unknown> = {};

        // Users can only see their own tickets
        if (user.role === 'USER') {
            where.userId = user.id;
        } else if (user.role === 'OPERATIONS') {
            // Operations can see assigned or unassigned tickets
            where.OR = [
                { assignedToId: user.id },
                { assignedToId: null },
            ];
        }
        // Admin can see all

        if (status) where.status = status;

        const [tickets, total] = await Promise.all([
            prisma.ticket.findMany({
                where,
                include: {
                    user: {
                        select: { id: true, name: true, phone: true },
                    },
                    assignedTo: {
                        select: { id: true, name: true },
                    },
                    messages: {
                        take: 1,
                        orderBy: { createdAt: 'desc' },
                    },
                },
                orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.ticket.count({ where }),
        ]);

        return NextResponse.json({
            tickets,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get tickets error:', error);
        return NextResponse.json(
            { message: 'حدث خطأ في جلب التذاكر' },
            { status: 500 }
        );
    }
}

// POST /api/tickets - Create a new ticket
export async function POST(request: NextRequest) {
    try {
        const user = await getSession();

        if (!user) {
            return NextResponse.json(
                { message: 'يجب تسجيل الدخول' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const validationResult = ticketSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { message: validationResult.error.errors[0].message },
                { status: 400 }
            );
        }

        const { subject, message, priority } = validationResult.data;

        const ticket = await prisma.ticket.create({
            data: {
                ticketNumber: generateTicketNumber(),
                userId: user.id,
                subject,
                priority,
                messages: {
                    create: {
                        userId: user.id,
                        message,
                    },
                },
            },
            include: {
                messages: true,
            },
        });

        // Audit log
        await createAuditLog({
            userId: user.id,
            action: 'CREATE',
            entity: 'Ticket',
            entityId: ticket.id,
            newData: { subject, priority },
        });

        // Notify Admins and Operations
        const notificationPayload = {
            title: 'تذكرة دعم فني جديدة',
            body: `تذكرة جديدة رقم #${ticket.ticketNumber}: ${subject}`,
            data: {
                type: 'NEW_TICKET',
                ticketId: ticket.id,
                url: `/admin/tickets/${ticket.id}`
            }
        };

        // We can send to both roles
        try {
            await Promise.all([
                sendPushToRole('ADMIN', notificationPayload),
                sendPushToRole('OPERATIONS', notificationPayload)
            ]);
        } catch (error) {
            console.error('Error sending ticket notifications:', error);
        }

        return NextResponse.json({
            message: 'تم إرسال التذكرة بنجاح',
            ticket,
        }, { status: 201 });
    } catch (error) {
        console.error('Create ticket error:', error);
        return NextResponse.json(
            { message: 'حدث خطأ في إنشاء التذكرة' },
            { status: 500 }
        );
    }
}
