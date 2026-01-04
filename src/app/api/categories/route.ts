import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { categorySchema } from '@/lib/validations';
import { createAuditLog } from '@/lib/audit';

// GET /api/categories - Get all categories
export async function GET() {
    try {
        // Get current user to filter by their service area
        const user = await getSession();
        let userServiceAreaId: string | null = null;

        if (user?.id) {
            const fullUser = await prisma.user.findUnique({
                where: { id: user.id },
                select: { serviceAreaId: true }
            });
            userServiceAreaId = fullUser?.serviceAreaId || null;
        }

        // Build where clause for categories
        const categoryWhere: Record<string, unknown> = {
            isActive: true,
            parentId: null
        };

        // If user has a service area, only show categories with products in that area
        if (userServiceAreaId) {
            categoryWhere.products = {
                some: {
                    isActive: true,
                    serviceAreas: {
                        some: {
                            serviceAreaId: userServiceAreaId
                        }
                    }
                }
            };
        }

        const categories = await prisma.category.findMany({
            where: categoryWhere,
            include: {
                children: {
                    where: {
                        isActive: true,
                        ...(userServiceAreaId && {
                            products: {
                                some: {
                                    isActive: true,
                                    serviceAreas: {
                                        some: {
                                            serviceAreaId: userServiceAreaId
                                        }
                                    }
                                }
                            }
                        })
                    },
                    include: {
                        _count: { select: { products: true } },
                    },
                },
                _count: { select: { products: true } },
            },
            orderBy: { sortOrder: 'asc' },
        });

        return NextResponse.json({ categories });
    } catch (error) {
        console.error('Get categories error:', error);
        return NextResponse.json(
            { message: 'حدث خطأ في جلب المتاجر' },
            { status: 500 }
        );
    }
}

// POST /api/categories - Create a new category (Admin/Operations only)
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
        const validationResult = categorySchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { message: validationResult.error.errors[0].message },
                { status: 400 }
            );
        }

        const data = validationResult.data;

        const category = await prisma.category.create({
            data: {
                name: data.name,
                nameEn: data.nameEn,
                description: data.description,
                parentId: data.parentId,
                sortOrder: data.sortOrder,
                isActive: data.isActive,
                image: data.image,
                banner: data.banner,
            },
        });

        // Audit log
        await createAuditLog({
            userId: user.id,
            action: 'CREATE',
            entity: 'Category',
            entityId: category.id,
            newData: data as Record<string, unknown>,
        });

        return NextResponse.json({
            message: 'تم إضافة المتجر بنجاح',
            category,
        }, { status: 201 });
    } catch (error) {
        console.error('Create category error:', error);
        return NextResponse.json(
            { message: 'حدث خطأ في إضافة المتجر' },
            { status: 500 }
        );
    }
}
