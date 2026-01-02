import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { notifyTicketUpdate, sendPushNotification, sendPushToRole } from '@/lib/notifications';

// GET /api/tickets/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getSession();
        if (!user) {
            return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
        }

        const { id } = await params;

        const ticket = await prisma.ticket.findUnique({
            where: { id },
            include: {
                user: { select: { name: true, phone: true } },
                assignedTo: { select: { name: true } },
                messages: {
                    include: { user: { select: { name: true } } },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });

        if (!ticket) {
            return NextResponse.json({ message: 'التذكرة غير موجودة' }, { status: 404 });
        }

        // Only allow access to own ticket or staff
        if (ticket.userId !== user.id && !['ADMIN', 'OPERATIONS'].includes(user.role)) {
            return NextResponse.json({ message: 'غير مصرح' }, { status: 403 });
        }

        // Get all users to check if message senders are staff
        const messageUserIds = ticket.messages.map(m => m.userId);
        const users = await prisma.user.findMany({
            where: { id: { in: messageUserIds } },
            select: { id: true, role: true }
        });

        const userRoleMap = new Map(users.map(u => [u.id, u.role]));

        // Map message field to content and add isStaff flag for frontend compatibility
        const ticketWithMappedMessages = {
            ...ticket,
            messages: ticket.messages.map(msg => ({
                id: msg.id,
                content: msg.message, // Map to content
                isStaff: ['ADMIN', 'OPERATIONS'].includes(userRoleMap.get(msg.userId) || ''),
                createdAt: msg.createdAt,
                user: msg.user
            }))
        };

        return NextResponse.json({ ticket: ticketWithMappedMessages });
    } catch (error) {
        console.error('Get ticket error:', error);
        return NextResponse.json({ message: 'حدث خطأ' }, { status: 500 });
    }
}

// POST /api/tickets/[id] - Add message
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getSession();
        if (!user) {
            return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
        }

        const { id } = await params;
        const { content } = await request.json();

        const ticket = await prisma.ticket.findUnique({ where: { id } });

        if (!ticket) {
            return NextResponse.json({ message: 'التذكرة غير موجودة' }, { status: 404 });
        }

        if (ticket.userId !== user.id && !['ADMIN', 'OPERATIONS'].includes(user.role)) {
            return NextResponse.json({ message: 'غير مصرح' }, { status: 403 });
        }

        const isStaff = ['ADMIN', 'OPERATIONS'].includes(user.role);

        const ticketMessage = await prisma.ticketMessage.create({
            data: {
                ticketId: id,
                userId: user.id,
                message: content,
            },
        });

        // Update ticket status if staff replies
        if (isStaff && ticket.status === 'OPEN') {
            await prisma.ticket.update({
                where: { id },
                data: { status: 'IN_PROGRESS', assignedToId: user.id },
            });
        }

        // Notify ticket owner if staff replied
        if (isStaff && ticket.userId !== user.id) {
            await notifyTicketUpdate(id, ticket.userId, 'تم الرد على تذكرتك من فريق الدعم');
        }

        // Notify staff if user replied
        if (!isStaff && ticket.userId === user.id) {
            const notificationPayload = {
                title: 'رد جديد على تذكرة',
                body: `رد جديد على التذكرة #${ticket.ticketNumber}`,
                data: {
                    type: 'TICKET_REPLY',
                    ticketId: ticket.id,
                    url: `/admin/tickets/${ticket.id}`
                }
            };

            if (ticket.assignedToId) {
                // If assigned, notify the assigned staff
                await sendPushNotification(ticket.assignedToId, notificationPayload);
            } else {
                // If unassigned, notify all admins/operations
                try {
                    await Promise.all([
                        sendPushToRole('ADMIN', notificationPayload),
                        sendPushToRole('OPERATIONS', notificationPayload)
                    ]);
                } catch (error) {
                    console.error('Error sending ticket reply notifications:', error);
                }
            }
        }

        return NextResponse.json({ message: 'تم الإرسال', data: ticketMessage });
    } catch (error) {
        console.error('Add message error:', error);
        return NextResponse.json({ message: 'حدث خطأ' }, { status: 500 });
    }
}

// PUT /api/tickets/[id] - Update ticket status
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getSession();
        if (!user || !['ADMIN', 'OPERATIONS'].includes(user.role)) {
            return NextResponse.json({ message: 'غير مصرح' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();

        const ticket = await prisma.ticket.update({
            where: { id },
            data: body,
        });

        return NextResponse.json({ message: 'تم التحديث', ticket });
    } catch (error) {
        console.error('Update ticket error:', error);
        return NextResponse.json({ message: 'حدث خطأ' }, { status: 500 });
    }
}
