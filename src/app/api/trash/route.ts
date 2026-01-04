import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET /api/trash - Get all deleted items (Admin only)
export async function GET(request: NextRequest) {
    try {
        const user = await getSession();

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json(
                { message: 'غير مصرح لك بهذا الإجراء' },
                { status: 403 }
            );
        }

        // Fetch all soft-deleted items
        const [users, products, offers, categories] = await Promise.all([
            prisma.user.findMany({
                where: { deletedAt: { not: null } },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    role: true,
                    deletedAt: true,
                },
                orderBy: { deletedAt: 'desc' },
            }),
            prisma.product.findMany({
                where: { deletedAt: { not: null } },
                select: {
                    id: true,
                    name: true,
                    price: true,
                    image: true,
                    category: { select: { name: true } },
                    deletedAt: true,
                },
                orderBy: { deletedAt: 'desc' },
            }),
            prisma.offer.findMany({
                where: { deletedAt: { not: null } },
                select: {
                    id: true,
                    title: true,
                    discountType: true,
                    discountValue: true,
                    deletedAt: true,
                },
                orderBy: { deletedAt: 'desc' },
            }),
            prisma.category.findMany({
                where: { deletedAt: { not: null } },
                select: {
                    id: true,
                    name: true,
                    image: true,
                    deletedAt: true,
                },
                orderBy: { deletedAt: 'desc' },
            }),
        ]);

        return NextResponse.json({
            users,
            products,
            offers,
            categories,
        });
    } catch (error) {
        console.error('Get trash error:', error);
        return NextResponse.json(
            { message: 'حدث خطأ في جلب سلة المهملات' },
            { status: 500 }
        );
    }
}
