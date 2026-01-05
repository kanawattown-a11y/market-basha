import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

// DELETE /api/reviews/[id] - Delete review (Admin only)
// NOTE: Deleting review does not affect Order or Product
// Only the review itself is removed
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getSession();
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ message: 'غير مصرح لك بهذا الإجراء' }, { status: 403 });
        }

        const { id } = await params;

        const existing = await prisma.review.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json({ message: 'التقييم غير موجود' }, { status: 404 });
        }

        // Delete review only - Order and Product remain intact
        await prisma.review.delete({ where: { id } });

        // Audit log
        await createAuditLog({
            userId: user.id,
            action: 'DELETE',
            entity: 'REVIEW',
            entityId: id,
            oldData: existing as unknown as Record<string, unknown>,
        });

        return NextResponse.json({ message: 'تم حذف التقييم' });
    } catch (error) {
        console.error('Delete review error:', error);
        return NextResponse.json({ message: 'حدث خطأ' }, { status: 500 });
    }
}
