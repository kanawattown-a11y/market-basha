import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { serviceAreaSchema } from '@/lib/validations';
import { createAuditLog } from '@/lib/audit';

// GET /api/service-areas - Get all service areas
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const activeOnly = searchParams.get('active') !== 'false';

        const where: Record<string, unknown> = {};
        if (activeOnly) where.isActive = true;

        const areas = await prisma.serviceArea.findMany({
            where,
            orderBy: { name: 'asc' },
        });

        return NextResponse.json({ areas });
    } catch (error) {
        console.error('Get service areas error:', error);
        return NextResponse.json(
            { message: 'حدث خطأ في جلب المناطق' },
            { status: 500 }
        );
    }
}

// POST /api/service-areas - Create a service area (Admin only)
export async function POST(request: NextRequest) {
    try {
        const user = await getSession();

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json(
                { message: 'غير مصرح لك بهذا الإجراء' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const validationResult = serviceAreaSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { message: validationResult.error.errors[0].message },
                { status: 400 }
            );
        }

        const data = validationResult.data;

        // Check if area already exists
        const existing = await prisma.serviceArea.findUnique({
            where: { name: data.name },
        });

        if (existing) {
            return NextResponse.json(
                { message: 'المنطقة موجودة مسبقاً' },
                { status: 400 }
            );
        }

        const area = await prisma.serviceArea.create({
            data,
        });

        // Audit log
        await createAuditLog({
            userId: user.id,
            action: 'CREATE',
            entity: 'SERVICE_AREA',
            entityId: area.id,
            newData: data as Record<string, unknown>,
        });

        return NextResponse.json({
            message: 'تم إضافة المنطقة بنجاح',
            area,
        }, { status: 201 });
    } catch (error) {
        console.error('Create service area error:', error);
        return NextResponse.json(
            { message: 'حدث خطأ في إضافة المنطقة' },
            { status: 500 }
        );
    }
}
