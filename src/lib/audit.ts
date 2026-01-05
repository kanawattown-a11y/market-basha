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
    | 'USER'
    | 'PRODUCT'
    | 'CATEGORY'
    | 'ORDER'
    | 'TICKET'
    | 'OFFER'
    | 'SERVICE_AREA'
    | 'ADDRESS'
    | 'REVIEW'
    | 'SETTINGS';

interface AuditLogData {
    userId?: string;
    action: AuditAction;
    entity: AuditEntity;
    entityId?: string;
    oldData?: Record<string, unknown>;
    newData?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
}

export async function createAuditLog(data: AuditLogData) {
    try {
        await prisma.auditLog.create({
            data: {
                userId: data.userId,
                action: data.action,
                entity: data.entity,
                entityId: data.entityId,
                oldData: data.oldData as Record<string, unknown> | undefined,
                newData: data.newData as Record<string, unknown> | undefined,
                metadata: data.metadata as Record<string, unknown> | undefined,
            },
        });
    } catch (error) {
        console.error('Error creating audit log:', error);
        // Don't throw - audit logging shouldn't break the main flow
    }
}

export async function getAuditLogs({
    userId,
    entity,
    entityId,
    action,
    startDate,
    endDate,
    page = 1,
    limit = 50,
}: {
    userId?: string;
    entity?: AuditEntity;
    entityId?: string;
    action?: AuditAction;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
}) {
    const where: Record<string, unknown> = {};

    if (userId) where.userId = userId;
    if (entity) where.entity = entity;
    if (entityId) where.entityId = entityId;
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

export async function getRecentActivity(userId: string, limit = 10) {
    const logs = await prisma.auditLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
    });

    return logs;
}
