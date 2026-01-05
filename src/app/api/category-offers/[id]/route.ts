import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

// GET /api/category-offers/[id] - Get single category offer
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const offer = await prisma.offer.findUnique({
            where: { id },
            include: {
                categories: {
                    include: {
                        category: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                                description: true,
                            },
                        },
                    },
                },
                createdBy: {
                    select: { id: true, name: true },
                },
            },
        });

        if (!offer || offer.deletedAt) {
            return NextResponse.json({ message: 'العرض غير موجود' }, { status: 404 });
        }

        return NextResponse.json({ offer });
    } catch (error) {
        console.error('Get category offer error:', error);
        return NextResponse.json({ message: 'حدث خطأ' }, { status: 500 });
    }
}

// PUT /api/category-offers/[id] - Update category offer
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getSession();
        if (!user || !['ADMIN', 'OPERATIONS'].includes(user.role)) {
            return NextResponse.json({ message: 'غير مصرح' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();

        const { categoryIds, ...data } = body;

        // Parse dates if they exist
        if (data.startDate) data.startDate = new Date(data.startDate);
        if (data.endDate) data.endDate = new Date(data.endDate);

        // Update offer
        const offer = await prisma.offer.update({
            where: { id },
            data: {
                ...data,
                // If categoryIds provided, update them
                ...(categoryIds && {
                    categories: {
                        deleteMany: {}, // Remove old associations
                        create: categoryIds.map((catId: string) => ({
                            categoryId: catId,
                        })),
                    },
                }),
            },
            include: {
                categories: {
                    include: {
                        category: true,
                    },
                },
            },
        });

        // Audit log
        await createAuditLog({
            userId: user.id,
            action: 'UPDATE',
            entity: 'CATEGORY_OFFER',
            entityId: id,
        });

        return NextResponse.json({ offer });
    } catch (error) {
        console.error('Update category offer error:', error);
        return NextResponse.json({ message: 'حدث خطأ' }, { status: 500 });
    }
}

// DELETE /api/category-offers/[id] - Soft delete category offer
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getSession();
        if (!user || !['ADMIN', 'OPERATIONS'].includes(user.role)) {
            return NextResponse.json({ message: 'غير مصرح' }, { status: 403 });
        }

        const { id } = await params;

        await prisma.offer.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        // Audit log
        await createAuditLog({
            userId: user.id,
            action: 'DELETE',
            entity: 'CATEGORY_OFFER',
            entityId: id,
        });

        return NextResponse.json({ message: 'تم نقل العرض إلى سلة المهملات' });
    } catch (error) {
        console.error('Delete category offer error:', error);
        return NextResponse.json({ message: 'حدث خطأ' }, { status: 500 });
    }
}
