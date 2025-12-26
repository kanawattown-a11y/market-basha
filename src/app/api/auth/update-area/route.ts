import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// PUT /api/auth/update-area - Update user's service area
export async function PUT(request: NextRequest) {
    try {
        const user = await getSession();

        if (!user) {
            return NextResponse.json(
                { message: 'غير مصرح' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { serviceAreaId } = body;

        if (!serviceAreaId) {
            return NextResponse.json(
                { message: 'يرجى اختيار منطقة' },
                { status: 400 }
            );
        }

        // Verify service area exists and is active
        const area = await prisma.serviceArea.findUnique({
            where: { id: serviceAreaId }
        });

        if (!area || !area.isActive) {
            return NextResponse.json(
                { message: 'المنطقة غير موجودة أو غير متاحة' },
                { status: 400 }
            );
        }

        // Update user's service area
        await prisma.user.update({
            where: { id: user.id },
            data: { serviceAreaId }
        });

        return NextResponse.json({
            message: 'تم تحديث المنطقة بنجاح',
            serviceAreaId
        });
    } catch (error) {
        console.error('Update area error:', error);
        return NextResponse.json(
            { message: 'حدث خطأ في الخادم' },
            { status: 500 }
        );
    }
}
