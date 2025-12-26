import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { updateUserSchema } from '@/lib/validations';
import { createAuditLog } from '@/lib/audit';
import { createAndSendNotification } from '@/lib/notifications';

// GET /api/users/[id] - Get a single user
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const currentUser = await getSession();

        if (!currentUser) {
            return NextResponse.json(
                { message: 'يجب تسجيل الدخول' },
                { status: 401 }
            );
        }

        const { id } = await params;

        // Users can only view their own profile unless admin
        if (currentUser.role !== 'ADMIN' && currentUser.id !== id) {
            return NextResponse.json(
                { message: 'غير مصرح لك بهذا الإجراء' },
                { status: 403 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                status: true,
                avatar: true,
                vehicleType: true,
                vehiclePlate: true,
                isAvailable: true,
                createdAt: true,
                lastLoginAt: true,
                addresses: true,
                _count: {
                    select: {
                        orders: true,
                        driverOrders: true,
                        tickets: true,
                    },
                },
            },
        });

        if (!user) {
            return NextResponse.json(
                { message: 'المستخدم غير موجود' },
                { status: 404 }
            );
        }

        return NextResponse.json({ user });
    } catch (error: unknown) {
        console.error('Get user error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { message: 'حدث خطأ في جلب بيانات المستخدم', error: errorMessage },
            { status: 500 }
        );
    }
}

// PUT /api/users/[id] - Update a user
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const currentUser = await getSession();

        if (!currentUser) {
            return NextResponse.json(
                { message: 'يجب تسجيل الدخول' },
                { status: 401 }
            );
        }

        const { id } = await params;

        // Users can only update their own profile unless admin/operations
        const isAdmin = currentUser.role === 'ADMIN';
        const isOperations = currentUser.role === 'OPERATIONS';

        // Get target user to check if it's a driver (for Operations access)
        const targetUser = await prisma.user.findUnique({ where: { id }, select: { role: true } });

        if (!targetUser) {
            return NextResponse.json(
                { message: 'المستخدم غير موجود' },
                { status: 404 }
            );
        }

        // Operations can only manage drivers
        const canOperationsManage = isOperations && targetUser.role === 'DRIVER';

        if (!isAdmin && !canOperationsManage && currentUser.id !== id) {
            return NextResponse.json(
                { message: 'غير مصرح لك بهذا الإجراء' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const validationResult = updateUserSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { message: validationResult.error.errors[0].message },
                { status: 400 }
            );
        }

        const data = validationResult.data;

        // Non-admins cannot change role or status
        if (!isAdmin) {
            delete data.role;
            delete data.status;
        }

        const oldUser = await prisma.user.findUnique({ where: { id } });

        if (!oldUser) {
            return NextResponse.json(
                { message: 'المستخدم غير موجود' },
                { status: 404 }
            );
        }

        const user = await prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                status: true,
                avatar: true,
            },
        });

        // Notify user of status change
        if (isAdmin && data.status && data.status !== oldUser.status) {
            const statusMessages: Record<string, string> = {
                APPROVED: 'تم تفعيل حسابك بنجاح! يمكنك الآن التسوق',
                REJECTED: 'تم رفض طلب تسجيلك',
                SUSPENDED: 'تم تعليق حسابك',
            };

            if (statusMessages[data.status]) {
                await createAndSendNotification(
                    id,
                    'NEW_USER',
                    'تحديث حالة الحساب',
                    statusMessages[data.status]
                );
            }
        }

        // Audit log
        await createAuditLog({
            userId: currentUser.id,
            action: data.status && data.status !== oldUser.status ? 'STATUS_CHANGE' : 'UPDATE',
            entity: 'User',
            entityId: id,
            oldData: { name: oldUser.name, role: oldUser.role, status: oldUser.status },
            newData: data as Record<string, unknown>,
        });

        return NextResponse.json({
            message: 'تم تحديث بيانات المستخدم بنجاح',
            user,
        });
    } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json(
            { message: 'حدث خطأ في تحديث بيانات المستخدم' },
            { status: 500 }
        );
    }
}

// DELETE /api/users/[id] - Delete a user (Admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const currentUser = await getSession();

        if (!currentUser || currentUser.role !== 'ADMIN') {
            return NextResponse.json(
                { message: 'غير مصرح لك بهذا الإجراء' },
                { status: 403 }
            );
        }

        const { id } = await params;

        // Cannot delete self
        if (currentUser.id === id) {
            return NextResponse.json(
                { message: 'لا يمكنك حذف حسابك' },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({ where: { id } });

        if (!user) {
            return NextResponse.json(
                { message: 'المستخدم غير موجود' },
                { status: 404 }
            );
        }

        await prisma.user.delete({ where: { id } });

        // Audit log
        await createAuditLog({
            userId: currentUser.id,
            action: 'DELETE',
            entity: 'User',
            entityId: id,
            oldData: { name: user.name, email: user.email, role: user.role },
        });

        return NextResponse.json({
            message: 'تم حذف المستخدم بنجاح',
        });
    } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json(
            { message: 'حدث خطأ في حذف المستخدم' },
            { status: 500 }
        );
    }
}
