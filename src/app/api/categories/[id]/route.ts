import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET /api/categories/[id] - Get single category
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                _count: { select: { products: true } },
                children: {
                    select: { id: true, name: true, image: true },
                },
            },
        });

        if (!category) {
            return NextResponse.json({ message: 'المتجر غير موجود' }, { status: 404 });
        }

        return NextResponse.json({ category });
    } catch (error) {
        console.error('Get category error:', error);
        return NextResponse.json({ message: 'حدث خطأ' }, { status: 500 });
    }
}

// PUT /api/categories/[id] - Update category
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

        const category = await prisma.category.update({
            where: { id },
            data: body,
        });

        return NextResponse.json({ message: 'تم التحديث', category });
    } catch (error) {
        console.error('Update category error:', error);
        return NextResponse.json({ message: 'حدث خطأ' }, { status: 500 });
    }
}

// DELETE /api/categories/[id] - Delete category
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getSession();
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ message: 'غير مصرح' }, { status: 403 });
        }

        const { id } = await params;

        // Check if category has products
        const productsCount = await prisma.product.count({ where: { categoryId: id } });
        if (productsCount > 0) {
            return NextResponse.json(
                { message: `لا يمكن حذف المتجر، يحتوي على ${productsCount} منتج` },
                { status: 400 }
            );
        }

        await prisma.category.delete({ where: { id } });

        return NextResponse.json({ message: 'تم الحذف' });
    } catch (error) {
        console.error('Delete category error:', error);
        return NextResponse.json({ message: 'حدث خطأ' }, { status: 500 });
    }
}
