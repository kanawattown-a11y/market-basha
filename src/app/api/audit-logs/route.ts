import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET /api/audit-logs - Get audit logs
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
        const entity = searchParams.get('entity');
        const action = searchParams.get('action');
        const userId = searchParams.get('userId');
        const search = searchParams.get('search');

        const where: Record<string, unknown> = {};

        if (entity) where.entity = entity;
        if (action) where.action = action;
        if (userId) where.userId = userId;
        if (search) {
            where.OR = [
                { entity: { contains: search, mode: 'insensitive' } },
                { action: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            role: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.auditLog.count({ where }),
        ]);

        return NextResponse.json({
            logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get audit logs error:', error);
        return NextResponse.json(
            { message: 'حدث خطأ في جلب السجلات' },
            { status: 500 }
        );
    }
}
