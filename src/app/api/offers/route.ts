import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { offerSchema } from '@/lib/validations';
import { createAuditLog } from '@/lib/audit';

// GET /api/offers - Get all offers
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const activeOnly = searchParams.get('active') === 'true';

        const now = new Date();

        const where: Record<string, unknown> = {};

        if (activeOnly) {
            where.isActive = true;
            where.startDate = { lte: now };
            where.endDate = { gte: now };
        }

        const offers = await prisma.offer.findMany({
            where,
            include: {
                products: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                                price: true,
                            },
                        },
                    },
                },
                createdBy: {
                    select: { id: true, name: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ offers });
    } catch (error) {
        console.error('Get offers error:', error);
        return NextResponse.json(
            { message: 'حدث خطأ في جلب العروض' },
            { status: 500 }
        );
    }
}

// POST /api/offers - Create a new offer (Operations/Admin only)
export async function POST(request: NextRequest) {
    try {
        const user = await getSession();

        if (!user || !['ADMIN', 'OPERATIONS'].includes(user.role)) {
            return NextResponse.json(
                { message: 'غير مصرح لك بهذا الإجراء' },
                { status: 403 }
            );
        }

        const body = await request.json();

        // Parse dates
        if (body.startDate) body.startDate = new Date(body.startDate);
        if (body.endDate) body.endDate = new Date(body.endDate);

        const validationResult = offerSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { message: validationResult.error.errors[0].message },
                { status: 400 }
            );
        }

        const { productIds, ...data } = validationResult.data;

        const offer = await prisma.offer.create({
            data: {
                ...data,
                createdById: user.id,
                products: productIds && productIds.length > 0 ? {
                    create: productIds.map((productId: string) => ({
                        productId,
                    })),
                } : undefined,
            },
            include: {
                products: {
                    include: { product: true },
                },
            },
        });

        // Audit log
        await createAuditLog({
            userId: user.id,
            action: 'CREATE',
            entity: 'Offer',
            entityId: offer.id,
            newData: data as Record<string, unknown>,
        });

        return NextResponse.json({
            message: 'تم إضافة العرض بنجاح',
            offer,
        }, { status: 201 });
    } catch (error) {
        console.error('Create offer error:', error);
        return NextResponse.json(
            { message: 'حدث خطأ في إضافة العرض' },
            { status: 500 }
        );
    }
}
