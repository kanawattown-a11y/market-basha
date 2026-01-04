import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { productSchema } from '@/lib/validations';
import { createAuditLog } from '@/lib/audit';
import { notifyLowStock } from '@/lib/notifications';
import { deleteFromS3 } from '@/lib/s3';

// GET /api/products/[id] - Get a single product
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                createdBy: {
                    select: { id: true, name: true },
                },
                serviceAreas: {
                    include: {
                        serviceArea: {
                            select: { id: true, name: true }
                        }
                    }
                },
            },
        });

        if (!product) {
            return NextResponse.json(
                { message: 'المنتج غير موجود' },
                { status: 404 }
            );
        }

        return NextResponse.json({ product });
    } catch (error) {
        console.error('Get product error:', error);
        return NextResponse.json(
            { message: 'حدث خطأ في جلب المنتج' },
            { status: 500 }
        );
    }
}

// PUT /api/products/[id] - Update a product
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getSession();

        if (!user || !['ADMIN', 'OPERATIONS'].includes(user.role)) {
            return NextResponse.json(
                { message: 'غير مصرح لك بهذا الإجراء' },
                { status: 403 }
            );
        }

        const { id } = await params;
        const body = await request.json();
        const validationResult = productSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { message: validationResult.error.errors[0].message },
                { status: 400 }
            );
        }

        const oldProduct = await prisma.product.findUnique({ where: { id } });

        if (!oldProduct) {
            return NextResponse.json(
                { message: 'المنتج غير موجود' },
                { status: 404 }
            );
        }

        const data = validationResult.data;

        const product = await prisma.product.update({
            where: { id },
            data,
            include: {
                category: true,
            },
        });

        // Sync service area relations if provided
        const serviceAreaIds = body.serviceAreaIds as string[] | undefined;
        if (serviceAreaIds !== undefined) {
            // Delete existing relations
            await prisma.productServiceArea.deleteMany({
                where: { productId: id }
            });
            // Create new relations
            if (serviceAreaIds.length > 0) {
                await prisma.productServiceArea.createMany({
                    data: serviceAreaIds.map(areaId => ({
                        productId: id,
                        serviceAreaId: areaId,
                    })),
                });
            }
        }

        // Check low stock
        if (product.trackStock && product.stock <= product.lowStockThreshold) {
            await notifyLowStock(product.id, product.name, product.stock);
        }

        // Audit log
        await createAuditLog({
            userId: user.id,
            action: 'UPDATE',
            entity: 'Product',
            entityId: product.id,
            oldData: oldProduct as unknown as Record<string, unknown>,
            newData: { ...data, serviceAreaIds } as Record<string, unknown>,
        });

        return NextResponse.json({
            message: 'تم تحديث المنتج بنجاح',
            product,
        });
    } catch (error) {
        console.error('Update product error:', error);
        return NextResponse.json(
            { message: 'حدث خطأ في تحديث المنتج' },
            { status: 500 }
        );
    }
}

// DELETE /api/products/[id] - Delete a product
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getSession();

        if (!user || !['ADMIN', 'OPERATIONS'].includes(user.role)) {
            return NextResponse.json(
                { message: 'غير مصرح لك بهذا الإجراء' },
                { status: 403 }
            );
        }

        const { id } = await params;

        const product = await prisma.product.findUnique({ where: { id } });

        if (!product) {
            return NextResponse.json(
                { message: 'المنتج غير موجود' },
                { status: 404 }
            );
        }

        // Soft delete (don't delete images, they may be needed for restore)
        await prisma.product.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        // Audit log
        await createAuditLog({
            userId: user.id,
            action: 'DELETE',
            entity: 'Product',
            entityId: id,
            oldData: product as unknown as Record<string, unknown>,
        });

        return NextResponse.json({
            message: 'تم نقل المنتج إلى سلة المهملات',
        });
    } catch (error) {
        console.error('Delete product error:', error);
        return NextResponse.json(
            { message: 'حدث خطأ في حذف المنتج' },
            { status: 500 }
        );
    }
}
