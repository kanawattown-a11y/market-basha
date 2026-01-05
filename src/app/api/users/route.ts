import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { createAndSendNotification } from '@/lib/notifications';

// GET /api/users - Get all users (Admin only)
export async function GET(request: NextRequest) {
    try {
        const user = await getSession();

        if (!user || !['ADMIN', 'OPERATIONS'].includes(user.role)) {
            return NextResponse.json(
                { message: 'غير مصرح لك بهذا الإجراء' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const role = searchParams.get('role');
        const status = searchParams.get('status');
        const isAvailable = searchParams.get('isAvailable');
        const search = searchParams.get('search');

        const where: Record<string, unknown> = {
            deletedAt: null, // CRITICAL: Exclude soft-deleted users
        };

        if (role) where.role = role;
        if (status) where.status = status;
        if (isAvailable !== null) where.isAvailable = isAvailable === 'true';
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
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
                    _count: {
                        select: {
                            orders: true,
                            driverOrders: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.user.count({ where }),
        ]);

        return NextResponse.json({
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get users error:', error);
        return NextResponse.json(
            { message: 'حدث خطأ في جلب المستخدمين' },
            { status: 500 }
        );
    }
}
