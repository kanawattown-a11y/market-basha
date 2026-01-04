import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

// GET /api/settings - Get system settings
export async function GET() {
    try {
        const user = await getSession();

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json(
                { message: 'غير مصرح لك بهذا الإجراء' },
                { status: 403 }
            );
        }

        let settings = await prisma.systemSettings.findUnique({
            where: { id: 'system' }
        });

        // Create default settings if they don't exist
        if (!settings) {
            settings = await prisma.systemSettings.create({
                data: {
                    id: 'system',
                    extraStoreFeePerStore: 5000
                }
            });
        }

        return NextResponse.json({
            extraStoreFeePerStore: Number(settings.extraStoreFeePerStore)
        });
    } catch (error) {
        console.error('Settings fetch error:', error);
        return NextResponse.json(
            { message: 'خطأ في جلب الإعدادات' },
            { status: 500 }
        );
    }
}

// PUT /api/settings - Update system settings
export async function PUT(request: NextRequest) {
    try {
        const user = await getSession();

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json(
                { message: 'غير مصرح لك بهذا الإجراء' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { extraStoreFeePerStore } = body;

        const oldSettings = await prisma.systemSettings.findUnique({
            where: { id: 'system' }
        });

        const settings = await prisma.systemSettings.upsert({
            where: { id: 'system' },
            update: {
                extraStoreFeePerStore
            },
            create: {
                id: 'system',
                extraStoreFeePerStore
            }
        });

        // Audit log
        await createAuditLog({
            userId: user.id,
            action: 'UPDATE',
            entity: 'SETTINGS',
            entityId: 'system',
            oldData: (oldSettings || undefined) as unknown as Record<string, unknown>,
            newData: settings as unknown as Record<string, unknown>,
        });

        return NextResponse.json({
            message: 'تم تحديث الإعدادات بنجاح',
            settings: {
                extraStoreFeePerStore: Number(settings.extraStoreFeePerStore)
            }
        });
    } catch (error) {
        console.error('Settings update error:', error);
        return NextResponse.json(
            { message: 'خطأ في تحديث الإعدادات' },
            { status: 500 }
        );
    }
}
