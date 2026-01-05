import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

// GET /api/offers/[id] - Get single offer
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const offer = await prisma.offer.findUnique({
            where: { id },
            include: {
                products: {
                    include: {
                        product: {
                            select: { id: true, name: true }
                        }
                    }
                }
            }
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
        if (!user || !['ADMIN', 'OPERATIONS'].includes(user.role)) {
            return NextResponse.json({ message: 'غير مصرح' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();

        // Extract productIds if present
        const { productIds, ...data } = body;

        // Parse dates if they exist
        if (data.startDate) data.startDate = new Date(data.startDate);
        if (data.endDate) data.endDate = new Date(data.endDate);

        // Update offer with product relations
        const offer = await prisma.offer.update({
            where: { id },
            data: {
                ...data,
                // Delete existing product relations and create new ones
                products: {
                    deleteMany: {}, // Remove all existing
                    ...(productIds && productIds.length > 0 ? {
                        create: productIds.map((productId: string) => ({
                            productId,
                        })),
                    } : {}),
                },
            },
            include: {
                products: {
                    include: { product: true },
                },
            },
        });

        // Audit log
        await createAuditLog({
            userId: user.id,
            action: 'UPDATE',
            entity: 'OFFER',
            entityId: id,
            newData: body as Record<string, unknown>,
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
            entity: 'OFFER',
            entityId: id,
        });

        return NextResponse.json({ message: 'تم الحذف' });
    } catch (error) {
        console.error('Delete offer error:', error);
        return NextResponse.json({ message: 'حدث خطأ' }, { status: 500 });
    }
}
