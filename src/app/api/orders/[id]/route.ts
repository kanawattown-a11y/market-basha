import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { notifyOrderStatusChange } from '@/lib/notifications';

// GET /api/orders/[id] - Get a single order
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getSession();

        if (!user) {
            return NextResponse.json(
                { message: 'يجب تسجيل الدخول' },
                { status: 401 }
            );
        }

        const { id } = await params;

        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                customer: {
                    select: { id: true, name: true, phone: true, email: true },
                },
                driver: {
                    select: { id: true, name: true, phone: true, vehicleType: true, vehiclePlate: true },
                },
                address: true,
                items: {
                    include: {
                        product: {
                            select: { id: true, name: true, image: true, unit: true },
                        },
                    },
                },
                statusHistory: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!order) {
            return NextResponse.json(
                { message: 'الطلب غير موجود' },
                { status: 404 }
            );
        }

        // Check access
        if (user.role === 'USER' && order.customerId !== user.id) {
            return NextResponse.json(
                { message: 'غير مصرح لك بعرض هذا الطلب' },
                { status: 403 }
            );
        }

        if (user.role === 'DRIVER' && order.driverId !== user.id) {
            return NextResponse.json(
                { message: 'غير مصرح لك بعرض هذا الطلب' },
                { status: 403 }
            );
        }

        return NextResponse.json({ order });
    } catch (error) {
        console.error('Get order error:', error);
        return NextResponse.json(
            { message: 'حدث خطأ في جلب الطلب' },
            { status: 500 }
        );
    }
}

// PUT /api/orders/[id] - Update order (status, driver assignment)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getSession();

        if (!user || !['ADMIN', 'OPERATIONS'].includes(user.role)) {
            return NextResponse.json(
                { message: 'غير مصرح لك بهذا الإجراء' },
                { status: 403 }
            );
        }

        const { id } = await params;
        const body = await request.json();
        const { status, driverId, internalNotes } = body;

        const oldOrder = await prisma.order.findUnique({
            where: { id },
            include: { driver: true },
        });

        if (!oldOrder) {
            return NextResponse.json(
                { message: 'الطلب غير موجود' },
                { status: 404 }
            );
        }

        const updateData: Record<string, unknown> = {};

        if (status && status !== oldOrder.status) {
            updateData.status = status;

            if (status === 'DELIVERED') {
                updateData.deliveredAt = new Date();
            }
        }

        if (driverId !== undefined) {
            updateData.driverId = driverId;
        }

        if (internalNotes !== undefined) {
            updateData.internalNotes = internalNotes;
        }

        const order = await prisma.order.update({
            where: { id },
            data: updateData,
            include: {
                customer: true,
                driver: true,
            },
        });

        // Add status history if status changed
        if (status && status !== oldOrder.status) {
            await prisma.orderStatusHistory.create({
                data: {
                    orderId: id,
                    status,
                    notes: body.statusNotes,
                },
            });

            // Notify customer
            await notifyOrderStatusChange(id, status, order.customerId, order.driverId);

            // When order is delivered, set driver as available again
            if (status === 'DELIVERED' && order.driverId) {
                await prisma.user.update({
                    where: { id: order.driverId },
                    data: { isAvailable: true },
                });
            }
        }

        // When driver is assigned, set them as busy (not available)
        if (driverId && driverId !== oldOrder.driverId) {
            await notifyOrderStatusChange(id, 'DRIVER_ASSIGNED', order.customerId, driverId);

            // Set driver as busy
            await prisma.user.update({
                where: { id: driverId },
                data: { isAvailable: false },
            });
        }

        // Audit log
        await createAuditLog({
            userId: user.id,
            action: 'STATUS_CHANGE',
            entity: 'Order',
            entityId: id,
            oldData: { status: oldOrder.status, driverId: oldOrder.driverId },
            newData: updateData,
        });

        return NextResponse.json({
            message: 'تم تحديث الطلب بنجاح',
            order,
        });
    } catch (error) {
        console.error('Update order error:', error);
        return NextResponse.json(
            { message: 'حدث خطأ في تحديث الطلب' },
            { status: 500 }
        );
    }
}
