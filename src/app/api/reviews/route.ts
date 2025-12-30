import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

const reviewSchema = z.object({
    orderId: z.string().min(1, 'معرف الطلب مطلوب'),
    productRating: z.number().min(1).max(5).optional(),
    driverRating: z.number().min(1).max(5).optional(),
    comment: z.string().max(500).optional(),
});

// GET /api/reviews - Get all reviews (Admin/Operations)
export async function GET(request: NextRequest) {
    try {
        const user = await getSession();

        if (!user || !['ADMIN', 'OPERATIONS'].includes(user.role)) {
            return NextResponse.json(
                { message: 'غير مصرح لك بهذا الإجراء' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const minRating = searchParams.get('minRating');
        const maxRating = searchParams.get('maxRating');

        const where: Record<string, unknown> = {};

        if (minRating) {
            where.productRating = { gte: parseInt(minRating) };
        }
        if (maxRating) {
            where.productRating = { ...where.productRating as object, lte: parseInt(maxRating) };
        }

        const [reviews, total] = await Promise.all([
            prisma.review.findMany({
                where,
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
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.review.count({ where }),
        ]);

        // Calculate average ratings
        const stats = await prisma.review.aggregate({
            _avg: {
                productRating: true,
                driverRating: true,
            },
            _count: {
                id: true,
            },
        });

        return NextResponse.json({
            reviews,
            stats: {
                totalReviews: stats._count.id,
                avgProductRating: stats._avg.productRating || 0,
                avgDriverRating: stats._avg.driverRating || 0,
            },
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get reviews error:', error);
        return NextResponse.json(
            { message: 'حدث خطأ في جلب التقييمات' },
            { status: 500 }
        );
    }
}

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest) {
    try {
        const user = await getSession();

        if (!user) {
            return NextResponse.json(
                { message: 'يجب تسجيل الدخول' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const validationResult = reviewSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { message: validationResult.error.errors[0].message },
                { status: 400 }
            );
        }

        const { orderId, productRating, driverRating, comment } = validationResult.data;

        // Check if order exists and belongs to user
        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
                customerId: user.id,
                status: 'DELIVERED',
            },
            include: {
                review: true,
            },
        });

        if (!order) {
            return NextResponse.json(
                { message: 'الطلب غير موجود أو لم يتم تسليمه بعد' },
                { status: 404 }
            );
        }

        // Check if review already exists
        if (order.review) {
            return NextResponse.json(
                { message: 'تم تقييم هذا الطلب مسبقاً' },
                { status: 400 }
            );
        }

        const review = await prisma.review.create({
            data: {
                orderId,
                userId: user.id,
                productRating,
                driverRating: order.driverId ? driverRating : null,
                comment,
            },
        });

        return NextResponse.json({
            message: 'تم إرسال التقييم بنجاح',
            review,
        }, { status: 201 });
    } catch (error) {
        console.error('Create review error:', error);
        return NextResponse.json(
            { message: 'حدث خطأ في إرسال التقييم' },
            { status: 500 }
        );
    }
}
