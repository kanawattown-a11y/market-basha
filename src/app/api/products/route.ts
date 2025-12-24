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

        const where: Record<string, unknown> = {
            isActive: true,
        };

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
                },
                orderBy: { [sortBy]: sortOrder },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.product.count({ where }),
        ]);

        return NextResponse.json({
            products,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
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

        // Check low stock
        if (product.trackStock && product.stock <= product.lowStockThreshold) {
            await notifyLowStock(product.id, product.name, product.stock);
        }

        // Audit log
        await createAuditLog({
            userId: user.id,
            action: 'CREATE',
            entity: 'Product',
            entityId: product.id,
            newData: data as Record<string, unknown>,
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
