import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

// POST /api/trash/[type]/[id]/restore - Restore a deleted item (Admin only)
export async function POST(
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

        let restored;
        let entityName;

        switch (type) {
            case 'users':
                restored = await prisma.user.update({
                    where: { id },
                    data: { deletedAt: null },
                });
                entityName = 'User';
                break;

            case 'products':
                restored = await prisma.product.update({
                    where: { id },
                    data: { deletedAt: null },
                });
                entityName = 'Product';
                break;

            case 'offers':
                restored = await prisma.offer.update({
                    where: { id },
                    data: { deletedAt: null },
                });
                entityName = 'Offer';
                break;

            case 'categories':
                restored = await prisma.category.update({
                    where: { id },
                    data: { deletedAt: null },
                });
                entityName = 'Category';
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
            action: 'UPDATE',
            entity: entityName as 'User' | 'Product' | 'Offer' | 'Category',
            entityId: id,
            newData: { restored: true },
        });

        return NextResponse.json({
            message: 'تم الاسترجاع بنجاح',
            item: restored,
        });
    } catch (error) {
        console.error('Restore item error:', error);
        return NextResponse.json(
            { message: 'حدث خطأ في الاسترجاع' },
            { status: 500 }
        );
    }
}
