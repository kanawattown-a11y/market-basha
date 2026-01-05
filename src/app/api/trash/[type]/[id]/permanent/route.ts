import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { deleteFromS3 } from '@/lib/s3';

/**
 * DELETE /api/trash/[type]/[id]/permanent
 * 
 * Permanently delete an item from trash (Admin only)
 * 
 * IMPORTANT: Deletes are NON-CASCADING
 * - Only the target entity is deleted
 * - All relationships are preserved
 * - Related data remains intact
 */
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
                // Delete user only - Orders, Reviews, Tickets remain intact
                // References will become NULL in related tables
                deleted = await prisma.user.delete({
                    where: { id }
                });
                entityName = 'USER';
                break;

            case 'products':
                // Delete product only - OrderItems remain, showing deleted product
                // Clean up S3 images first
                const product = await prisma.product.findUnique({ where: { id } });
                if (product) {
                    if (product.image) {
                        await deleteFromS3(product.image).catch(() => { });
                    }
                    if (product.images?.length > 0) {
                        for (const img of product.images) {
                            await deleteFromS3(img).catch(() => { });
                        }
                    }
                }
                deleted = await prisma.product.delete({ where: { id } });
                entityName = 'PRODUCT';
                break;

            case 'offers':
                // Delete offer only - OfferProducts cascade delete is OK
                // Orders with this offer remain intact
                deleted = await prisma.offer.delete({ where: { id } });
                entityName = 'OFFER';
                break;

            case 'categories':
                // Delete category only - Products remain but need category reassignment
                // Check if any products still reference this category
                const activeProducts = await prisma.product.count({
                    where: { categoryId: id, deletedAt: null },
                });

                if (activeProducts > 0) {
                    return NextResponse.json(
                        { message: `لا يمكن الحذف النهائي، يوجد ${activeProducts} منتج نشط مرتبط بهذا التصنيف` },
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

        // Check for foreign key constraint errors
        if (error instanceof Error && error.message.includes('foreign key constraint')) {
            return NextResponse.json(
                { message: 'لا يمكن الحذف لوجود بيانات مرتبطة' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: 'حدث خطأ في الحذف النهائي' },
            { status: 500 }
        );
    }
}
