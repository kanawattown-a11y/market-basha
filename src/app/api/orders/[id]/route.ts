import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { notifyOrderStatusChange } from '@/lib/notifications';
import { OrderStatus } from '@prisma/client';

// Order state machine - valid transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PREPARING', 'CANCELLED'],
    PREPARING: ['READY', 'CANCELLED'],
    READY: ['OUT_FOR_DELIVERY', 'CANCELLED'],
    OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
    DELIVERED: [], // Terminal state
    CANCELLED: [], // Terminal state
};

function validateStateTransition(currentStatus: string, newStatus: string): { valid: boolean; message?: string } {
    if (currentStatus === newStatus) {
        return { valid: true };
    }

    const allowedTransitions = VALID_TRANSITIONS[currentStatus] || [];

    if (!allowedTransitions.includes(newStatus)) {
        const allowedText = allowedTransitions.length > 0
            ? `الحالات المسموحة: ${allowedTransitions.join('، ')}`
            : 'لا يمكن تغيير هذه الحالة';

        return {
            valid: false,
            message: `لا يمكن تغيير حالة الطلب من "${currentStatus}" إلى "${newStatus}". ${allowedText}`
        };
    }

    return { valid: true };
}

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

        if (!user || !['ADMIN', 'OPERATIONS', 'DRIVER'].includes(user.role)) {
            return NextResponse.json(
                { message: 'غير مصرح لك بهذا الإجراء' },
                { status: 403 }
            );
        }

        const { id } = await params;
        const body = await request.json();
        const { status, driverId, internalNotes, driverDeliveryCost } = body;

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

        // Check permissions
        if (user.role === 'DRIVER') {
            // Drivers can only update their own orders
            if (oldOrder.driverId !== user.id) {
                return NextResponse.json(
                    { message: 'لا يمكنك تحديث هذا الطلب' },
                    { status: 403 }
                );
            }
            // Drivers can only update status (not assign drivers, etc)
            if (driverId !== undefined || internalNotes !== undefined || driverDeliveryCost !== undefined) {
                return NextResponse.json(
                    { message: 'غير مصرح لك بهذا الإجراء' },
                    { status: 403 }
                );
            }
            // Drivers can ONLY mark orders as DELIVERED (cannot cancel)
            if (status && status !== 'DELIVERED') {
                return NextResponse.json(
                    { message: 'يمكنك فقط تأكيد توصيل الطلب' },
                    { status: 403 }
                );
            }
            // Driver can only deliver from OUT_FOR_DELIVERY status
            if (status === 'DELIVERED' && oldOrder.status !== 'OUT_FOR_DELIVERY') {
                return NextResponse.json(
                    { message: 'الطلب ليس في حالة التوصيل بعد' },
                    { status: 400 }
                );
            }
        }

        const updateData: Record<string, unknown> = {};

        if (status && status !== oldOrder.status) {
            // Validate state transition
            const validation = validateStateTransition(oldOrder.status, status);
            if (!validation.valid) {
                return NextResponse.json(
                    { message: validation.message },
                    { status: 400 }
                );
            }

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

        // Allow admin/operations to set driver delivery cost
        if (driverDeliveryCost !== undefined) {
            updateData.driverDeliveryCost = driverDeliveryCost;
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

            // When order is cancelled, free the driver if assigned
            if (status === 'CANCELLED' && order.driverId) {
                await prisma.user.update({
                    where: { id: order.driverId },
                    data: { isAvailable: true },
                });
            }
        }

        // When driver is assigned, set them as busy (not available)
        if (driverId && driverId !== oldOrder.driverId) {
            // Get driver info for notification
            const driver = await prisma.user.findUnique({
                where: { id: driverId },
                select: { name: true }
            });

            await notifyOrderStatusChange(
                id,
                'DRIVER_ASSIGNED',
                order.customerId,
                driverId,
                driver?.name
            );

            // Set new driver as busy
            await prisma.user.update({
                where: { id: driverId },
                data: { isAvailable: false },
            });

            // Free the old driver if there was one
            if (oldOrder.driverId) {
                await prisma.user.update({
                    where: { id: oldOrder.driverId },
                    data: { isAvailable: true },
                });
            }
        }

        // Broadcast order update via Socket.IO
        try {
            const { broadcastOrderEvent } = await import('@/lib/socket');
            broadcastOrderEvent('order:updated', {
                id: order.id,
                orderNumber: order.orderNumber,
                status: order.status,
                driverId: order.driverId,
            });
        } catch (error) {
            console.error('Socket.IO broadcast error:', error);
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
