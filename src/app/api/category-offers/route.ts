import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

// GET /api/category-offers - List all category offers
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const activeOnly = searchParams.get('active') === 'true';
        const categoryId = searchParams.get('categoryId');

        const now = new Date();

        const where: Record<string, unknown> = {
            deletedAt: null, // Exclude soft-deleted offers
        };

        if (activeOnly) {
            where.isActive = true;
            where.startDate = { lte: now };
            where.endDate = { gte: now };
        }

        if (categoryId) {
            where.categories = {
                some: {
                    categoryId: categoryId
                }
            };
        }

        const offers = await prisma.offer.findMany({
            where,
            include: {
                categories: {
                    include: {
                        category: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
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
        console.error('Get category offers error:', error);
        return NextResponse.json(
            { message: 'حدث خطأ في جلب العروض' },
            { status: 500 }
        );
    }
}

// POST /api/category-offers - Create new category offer
export async function POST(request: NextRequest) {
    try {
        const user = await getSession();
        if (!user || !['ADMIN', 'OPERATIONS'].includes(user.role)) {
            return NextResponse.json({ message: 'غير مصرح' }, { status: 403 });
        }

        const body = await request.json();
        const {
            title,
            titleEn,
            description,
            image,
            discountType,
            discountValue,
            minOrderAmount,
            startDate,
            endDate,
            isActive,
            categoryIds,
        } = body;

        // Validation
        if (!title || !discountType || !discountValue || !startDate || !endDate || !categoryIds || categoryIds.length === 0) {
            return NextResponse.json(
                { message: 'الرجاء ملء جميع الحقول المطلوبة' },
                { status: 400 }
            );
        }

        // Create offer with category relations
        const offer = await prisma.offer.create({
            data: {
                title,
                titleEn,
                description,
                image,
                discountType,
                discountValue,
                minOrderAmount,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                isActive: isActive ?? true,
                createdById: user.id,
                categories: {
                    create: categoryIds.map((catId: string) => ({
                        categoryId: catId,
                    })),
                },
            },
            include: {
                categories: {
                    include: {
                        category: true,
                    },
                },
            },
        });

        // Audit log
        await createAuditLog({
            userId: user.id,
            action: 'CREATE',
            entity: 'CATEGORY_OFFER',
            entityId: offer.id,
        });

        return NextResponse.json({ offer }, { status: 201 });
    } catch (error) {
        console.error('Create category offer error:', error);
        return NextResponse.json(
            { message: 'حدث خطأ في إنشاء العرض' },
            { status: 500 }
        );
    }
}
