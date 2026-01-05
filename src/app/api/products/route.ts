import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { productSchema } from '@/lib/validations';
import { createAuditLog } from '@/lib/audit';
import { notifyLowStock } from '@/lib/notifications';

// GET /api/products - Get all products with filters
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const category = searchParams.get('category');
        const search = searchParams.get('search');
        const featured = searchParams.get('featured') === 'true';
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

        const ids = searchParams.get('ids');

        // Optional: allow filtering by specific service area (for guests or explicit choice)
        const serviceAreaParam = searchParams.get('serviceArea');

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

        // Determine which service area to filter by
        const filterAreaId = serviceAreaParam || userServiceAreaId;

        const where: Record<string, unknown> = {
            isActive: true,
        };

        if (ids) {
            const idsArray = ids.split(',').filter(Boolean);
            if (idsArray.length > 0) {
                where.id = { in: idsArray };
            }
        }

        // Filter by service area if user has one or if specified in query
        if (filterAreaId) {
            where.serviceAreas = {
                some: {
                    serviceAreaId: filterAreaId
                }
            };
        }

        if (category) where.categoryId = category;
        if (featured) where.isFeatured = true;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    category: {
                        select: { id: true, name: true },
                    },
                    serviceAreas: {
                        include: {
                            serviceArea: {
                                select: { id: true, name: true }
                            }
                        }
                    }
                },
                orderBy: { [sortBy]: sortOrder },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.product.count({ where }),
        ]);

        // Get active offers
        const now = new Date();
        const activeOffers = await prisma.offer.findMany({
            where: {
                isActive: true,
                startDate: { lte: now },
                endDate: { gte: now },
            },
            include: {
                products: {
                    select: {
                        productId: true,
                    },
                },
            },
        });

        // Map products to their offers
        const productsWithOffers = products.map(product => {
            const offer = activeOffers.find(o =>
                o.products.some(p => p.productId === product.id)
            );

            if (offer) {
                const originalPrice = Number(product.price);
                let finalPrice = originalPrice;

                if (offer.discountType.toLowerCase() === 'percentage') {
                    finalPrice = originalPrice - (originalPrice * Number(offer.discountValue) / 100);
                } else {
                    finalPrice = originalPrice - Number(offer.discountValue);
                }

                return {
                    ...product,
                    activeOffer: {
                        id: offer.id,
                        title: offer.title,
                        discountType: offer.discountType,
                        discountValue: offer.discountValue,
                        finalPrice: Math.max(0, finalPrice),
                    },
                };
            }

            return product;
        });

        return NextResponse.json({
            products: productsWithOffers,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            userServiceAreaId: filterAreaId,
        });
    } catch (error) {
        console.error('Get products error:', error);
        return NextResponse.json(
            { message: 'حدث خطأ في جلب المنتجات' },
            { status: 500 }
        );
    }
}

// POST /api/products - Create a new product (Operations/Admin only)
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
        const validationResult = productSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { message: validationResult.error.errors[0].message },
                { status: 400 }
            );
        }

        const data = validationResult.data;

        // Auto-generate SKU if not provided
        if (!data.sku) {
            const timestamp = Date.now().toString(36).toUpperCase();
            const random = Math.random().toString(36).substring(2, 6).toUpperCase();
            data.sku = `PRD-${timestamp}-${random}`;
        }

        const product = await prisma.product.create({
            data: {
                ...data,
                createdById: user.id,
            },
            include: {
                category: true,
            },
        });

        // Create service area relations if provided
        const serviceAreaIds = body.serviceAreaIds as string[] | undefined;
        if (serviceAreaIds && serviceAreaIds.length > 0) {
            await prisma.productServiceArea.createMany({
                data: serviceAreaIds.map(areaId => ({
                    productId: product.id,
                    serviceAreaId: areaId,
                })),
            });
        }

        // Check low stock
        if (product.trackStock && product.stock <= product.lowStockThreshold) {
            await notifyLowStock(product.id, product.name, product.stock);
        }

        // Audit log
        await createAuditLog({
            userId: user.id,
            action: 'CREATE',
            entity: 'PRODUCT',
            entityId: product.id,
            newData: { ...data, serviceAreaIds } as Record<string, unknown>,
        });

        return NextResponse.json({
            message: 'تم إضافة المنتج بنجاح',
            product,
        }, { status: 201 });
    } catch (error) {
        console.error('Create product error:', error);
        return NextResponse.json(
            { message: 'حدث خطأ في إضافة المنتج' },
            { status: 500 }
        );
    }
}
