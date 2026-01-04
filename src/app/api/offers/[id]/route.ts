import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET /api/offers/[id] - Get single offer
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const offer = await prisma.offer.findUnique({
            where: { id },
        });

        if (!offer) {
            return NextResponse.json({ message: 'العرض غير موجود' }, { status: 404 });
        }

        return NextResponse.json({ offer });
    } catch (error) {
        console.error('Get offer error:', error);
        return NextResponse.json({ message: 'حدث خطأ' }, { status: 500 });
    }
}

// PUT /api/offers/[id] - Update offer
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getSession();
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ message: 'غير مصرح' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();

        const offer = await prisma.offer.update({
            where: { id },
            data: body,
        });

        return NextResponse.json({ message: 'تم التحديث', offer });
    } catch (error) {
        console.error('Update offer error:', error);
        return NextResponse.json({ message: 'حدث خطأ' }, { status: 500 });
    }
}

// DELETE /api/offers/[id] - Delete offer
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

        await prisma.offer.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        return NextResponse.json({ message: 'تم نقل العرض إلى سلة المهملات' });
    } catch (error) {
        console.error('Delete offer error:', error);
        return NextResponse.json({ message: 'حدث خطأ' }, { status: 500 });
    }
}
