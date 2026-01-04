import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { deleteFromS3 } from '@/lib/s3';

// DELETE /api/trash/[type]/[id]/permanent - Permanently delete an item (Admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ type: string; id: string }> }
) {
    try {
        const user = await getSession();

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json(
                { message: 'غير مصرح لك بهذا الإجراء' },
                { status: 403 }
            );
        }

        const { type, id } = await params;

        let deleted;
        let entityName;

        switch (type) {
            case 'users':
                deleted = await prisma.user.delete({ where: { id } });
                entityName = 'USER';
                break;

            case 'products':
                // Get product to delete images
                const product = await prisma.product.findUnique({ where: { id } });
                if (product) {
                    // Delete images from S3
                    if (product.image) {
                        await deleteFromS3(product.image);
                    }
                    if (product.images.length > 0) {
                        for (const img of product.images) {
                            await deleteFromS3(img);
                        }
                    }
                }
                deleted = await prisma.product.delete({ where: { id } });
                entityName = 'PRODUCT';
                break;

            case 'offers':
                deleted = await prisma.offer.delete({ where: { id } });
                entityName = 'OFFER';
                break;

            case 'categories':
                // Check if category has products
                const productsCount = await prisma.product.count({
                    where: { categoryId: id, deletedAt: null },
                });
                if (productsCount > 0) {
                    return NextResponse.json(
                        { message: `لا يمكن الحذف النهائي، المتجر يحتوي على ${productsCount} منتج نشط` },
                        { status: 400 }
                    );
                }
                deleted = await prisma.category.delete({ where: { id } });
                entityName = 'CATEGORY';
                break;

            default:
                return NextResponse.json(
                    { message: 'نوع غير صالح' },
                    { status: 400 }
                );
        }

        // Audit log
        await createAuditLog({
            userId: user.id,
            action: 'DELETE',
            entity: entityName as 'USER' | 'PRODUCT' | 'OFFER' | 'CATEGORY',
            entityId: id,
            oldData: deleted as unknown as Record<string, unknown>,
        });

        return NextResponse.json({
            message: 'تم الحذف النهائي بنجاح',
        });
    } catch (error) {
        console.error('Permanent delete error:', error);
        return NextResponse.json(
            { message: 'حدث خطأ في الحذف النهائي' },
            { status: 500 }
        );
    }
}
