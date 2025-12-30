import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET /api/reviews/[id] - Get single review
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getSession();
        if (!user) {
            return NextResponse.json({ message: 'يجب تسجيل الدخول' }, { status: 401 });
        }

        const { id } = await params;

        const review = await prisma.review.findUnique({
            where: { id },
            include: {
                user: {
                    select: { id: true, name: true, phone: true },
                },
                order: {
                    select: {
                        id: true,
                        orderNumber: true,
                        driver: {
                            select: { id: true, name: true },
                        },
                        items: {
                            include: {
                                product: {
                                    select: { id: true, name: true, image: true },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!review) {
            return NextResponse.json({ message: 'التقييم غير موجود' }, { status: 404 });
        }

        return NextResponse.json({ review });
    } catch (error) {
        console.error('Get review error:', error);
        return NextResponse.json({ message: 'حدث خطأ' }, { status: 500 });
    }
}

// DELETE /api/reviews/[id] - Delete review (Admin only)
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

        await prisma.review.delete({ where: { id } });

        return NextResponse.json({ message: 'تم حذف التقييم' });
    } catch (error) {
        console.error('Delete review error:', error);
        return NextResponse.json({ message: 'حدث خطأ' }, { status: 500 });
    }
}
