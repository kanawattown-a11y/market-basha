import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

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

        return NextResponse.json({ ticket });
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
                isStaff,
            },
        });

        // Update ticket status if staff replies
        if (isStaff && ticket.status === 'OPEN') {
            await prisma.ticket.update({
                where: { id },
                data: { status: 'IN_PROGRESS', assignedToId: user.id },
            });
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
