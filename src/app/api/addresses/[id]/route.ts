import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { addressSchema } from '@/lib/validations';
import { createAuditLog } from '@/lib/audit';

// GET /api/addresses/[id] - Get single address
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

        const address = await prisma.address.findFirst({
            where: { id, userId: user.id },
        });

        if (!address) {
            return NextResponse.json({ message: 'العنوان غير موجود' }, { status: 404 });
        }

        return NextResponse.json({ address });
    } catch (error) {
        console.error('Get address error:', error);
        return NextResponse.json({ message: 'حدث خطأ' }, { status: 500 });
    }
}

// PUT /api/addresses/[id] - Update address
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getSession();
        if (!user) {
            return NextResponse.json({ message: 'يجب تسجيل الدخول' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

        const existing = await prisma.address.findFirst({
            where: { id, userId: user.id },
        });

        if (!existing) {
            return NextResponse.json({ message: 'العنوان غير موجود' }, { status: 404 });
        }

        // If setting as default, unset others
        if (body.isDefault) {
            await prisma.address.updateMany({
                where: { userId: user.id, isDefault: true },
                data: { isDefault: false },
            });
        }

        // Only allow specific fields to be updated
        const updateData: Record<string, unknown> = {};
        if (body.title !== undefined) updateData.title = body.title;
        if (body.fullAddress !== undefined) updateData.fullAddress = body.fullAddress;
        if (body.area !== undefined) updateData.area = body.area;
        if (body.building !== undefined) updateData.building = body.building || null;
        if (body.floor !== undefined) updateData.floor = body.floor || null;
        if (body.notes !== undefined) updateData.notes = body.notes || null;
        if (body.isDefault !== undefined) updateData.isDefault = body.isDefault;

        const address = await prisma.address.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({ message: 'تم التحديث', address });
    } catch (error) {
        console.error('Update address error:', error);
        return NextResponse.json({ message: 'حدث خطأ' }, { status: 500 });
    }
}

// DELETE /api/addresses/[id] - Delete address
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getSession();
        if (!user) {
            return NextResponse.json({ message: 'يجب تسجيل الدخول' }, { status: 401 });
        }

        const { id } = await params;

        const existing = await prisma.address.findFirst({
            where: { id, userId: user.id },
        });

        if (!existing) {
            return NextResponse.json({ message: 'العنوان غير موجود' }, { status: 404 });
        }

        await prisma.address.delete({ where: { id } });

        // If deleted was default, set another as default
        if (existing.isDefault) {
            const another = await prisma.address.findFirst({
                where: { userId: user.id },
            });
            if (another) {
                await prisma.address.update({
                    where: { id: another.id },
                    data: { isDefault: true },
                });
            }
        }

        return NextResponse.json({ message: 'تم الحذف' });
    } catch (error) {
        console.error('Delete address error:', error);
        return NextResponse.json({ message: 'حدث خطأ' }, { status: 500 });
    }
}
