import { prisma } from './prisma';

export type AuditAction =
    | 'CREATE'
    | 'UPDATE'
    | 'DELETE'
    | 'LOGIN'
    | 'LOGOUT'
    | 'APPROVE'
    | 'REJECT'
    | 'ASSIGN'
    | 'STATUS_CHANGE';

export type AuditEntity =
    | 'User'
    | 'Product'
    | 'Category'
    | 'Order'
    | 'Ticket'
    | 'Offer'
    | 'ServiceArea'
    | 'Address'
    | 'Settings';

interface AuditLogData {
    userId?: string;
    action: AuditAction;
    entity: AuditEntity;
    entityId?: string;
    oldData?: Record<string, unknown>;
    newData?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
}

// إنشاء سجل عمليات
export async function createAuditLog(data: AuditLogData): Promise<void> {
    try {
        await prisma.auditLog.create({
            data: {
                userId: data.userId,
                action: data.action,
                entity: data.entity,
                entityId: data.entityId,
                oldData: data.oldData || null,
                newData: data.newData || null,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent,
            },
        });
    } catch (error) {
        console.error('Error creating audit log:', error);
    }
}

// الحصول على سجل العمليات مع فلترة
export async function getAuditLogs(options: {
    userId?: string;
    entity?: AuditEntity;
    action?: AuditAction;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
}) {
    const { userId, entity, action, startDate, endDate, page = 1, limit = 50 } = options;

    const where: Record<string, unknown> = {};

    if (userId) where.userId = userId;
    if (entity) where.entity = entity;
    if (action) where.action = action;
    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) (where.createdAt as Record<string, unknown>).gte = startDate;
        if (endDate) (where.createdAt as Record<string, unknown>).lte = endDate;
    }

    const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
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

    return {
        logs,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

// تنظيف السجلات القديمة (أكثر من 90 يوم)
export async function cleanupOldAuditLogs(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await prisma.auditLog.deleteMany({
        where: {
            createdAt: { lt: cutoffDate },
        },
    });

    return result.count;
}
