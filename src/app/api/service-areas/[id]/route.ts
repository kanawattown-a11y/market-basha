import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET /api/service-areas/[id] - Get single area
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const area = await prisma.serviceArea.findUnique({
            where: { id },
        });

        if (!area) {
            return NextResponse.json({ message: 'المنطقة غير موجودة' }, { status: 404 });
        }

        return NextResponse.json({ area });
    } catch (error) {
        console.error('Get area error:', error);
        return NextResponse.json({ message: 'حدث خطأ' }, { status: 500 });
    }
}

// PUT /api/service-areas/[id] - Update area
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

        const area = await prisma.serviceArea.update({
            where: { id },
            data: body,
        });

        return NextResponse.json({ message: 'تم التحديث', area });
    } catch (error) {
        console.error('Update area error:', error);
        return NextResponse.json({ message: 'حدث خطأ' }, { status: 500 });
    }
}

// DELETE /api/service-areas/[id] - Delete area
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

        await prisma.serviceArea.delete({ where: { id } });

        return NextResponse.json({ message: 'تم الحذف' });
    } catch (error) {
        console.error('Delete area error:', error);
        return NextResponse.json({ message: 'حدث خطأ' }, { status: 500 });
    }
}
