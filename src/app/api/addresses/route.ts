import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { addressSchema } from '@/lib/validations';
import { createAuditLog } from '@/lib/audit';

// GET /api/addresses - Get user's addresses
export async function GET() {
    try {
        const user = await getSession();

        if (!user) {
            return NextResponse.json(
                { message: 'يجب تسجيل الدخول' },
                { status: 401 }
            );
        }

        const addresses = await prisma.address.findMany({
            where: { userId: user.id },
            orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        });

        return NextResponse.json({ addresses });
    } catch (error) {
        console.error('Get addresses error:', error);
        return NextResponse.json(
            { message: 'حدث خطأ في جلب العناوين' },
            { status: 500 }
        );
    }
}

// POST /api/addresses - Create a new address
export async function POST(request: NextRequest) {
    try {
        const user = await getSession();

        if (!user) {
            return NextResponse.json(
                { message: 'يجب تسجيل الدخول' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const validationResult = addressSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { message: validationResult.error.errors[0].message },
                { status: 400 }
            );
        }

        const data = validationResult.data;

        // Check if area is served
        const serviceArea = await prisma.serviceArea.findFirst({
            where: { name: data.area, isActive: true },
        });

        if (!serviceArea) {
            return NextResponse.json(
                { message: 'المنطقة غير متاحة للتوصيل حالياً' },
                { status: 400 }
            );
        }

        // If this is default, unset other defaults
        if (data.isDefault) {
            await prisma.address.updateMany({
                where: { userId: user.id, isDefault: true },
                data: { isDefault: false },
            });
        }

        // If this is the first address, make it default
        const addressCount = await prisma.address.count({
            where: { userId: user.id },
        });

        const address = await prisma.address.create({
            data: {
                ...data,
                userId: user.id,
                isDefault: data.isDefault || addressCount === 0,
            },
        });

        // Audit log
        await createAuditLog({
            userId: user.id,
            action: 'CREATE',
            entity: 'ADDRESS',
            entityId: address.id,
            newData: data as Record<string, unknown>,
        });

        return NextResponse.json({
            message: 'تم إضافة العنوان بنجاح',
            address,
        }, { status: 201 });
    } catch (error) {
        console.error('Create address error:', error);
        return NextResponse.json(
            { message: 'حدث خطأ في إضافة العنوان' },
            { status: 500 }
        );
    }
}
