import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { orderSchema } from '@/lib/validations';
import { createAuditLog } from '@/lib/audit';
import { notifyNewOrder, notifyOrderStatusChange } from '@/lib/notifications';
import { generateOrderNumber } from '@/lib/utils';

// GET /api/orders - Get orders
export async function GET(request: NextRequest) {
    try {
        const user = await getSession();

        if (!user) {
            return NextResponse.json(
                { message: 'يجب تسجيل الدخول' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const status = searchParams.get('status');

        const where: Record<string, unknown> = {};

        // Filter based on role
        if (user.role === 'USER') {
            where.customerId = user.id;
        } else if (user.role === 'DRIVER') {
            where.driverId = user.id;
        }
        // ADMIN and OPERATIONS can see all orders

        if (status) {
            if (status.includes(',')) {
                where.status = { in: status.split(',') };
            } else {
                where.status = status;
            }
        }

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    customer: {
                        select: { id: true, name: true, phone: true },
                    },
                    driver: {
                        select: { id: true, name: true, phone: true },
                    },
                    address: true,
                    items: {
                        include: {
                            product: {
                                select: { id: true, name: true, image: true },
                            },
                        },
                    },
                    statusHistory: {
                        orderBy: { createdAt: 'desc' },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.order.count({ where }),
        ]);

        return NextResponse.json({
            orders,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get orders error:', error);
        return NextResponse.json(
            { message: 'حدث خطأ في جلب الطلبات' },
            { status: 500 }
        );
    }
}

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
    try {
        const user = await getSession();

        if (!user) {
            return NextResponse.json(
                { message: 'يجب تسجيل الدخول' },
                { status: 401 }
            );
        }

        if (user.status !== 'APPROVED') {
            return NextResponse.json(
                { message: 'حسابك غير مفعل' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const validationResult = orderSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { message: validationResult.error.errors[0].message },
                { status: 400 }
            );
        }

        const { addressId, items, notes } = validationResult.data;

        // Verify address belongs to user
        const address = await prisma.address.findFirst({
            where: { id: addressId, userId: user.id },
        });

        if (!address) {
            return NextResponse.json(
                { message: 'العنوان غير صالح' },
                { status: 400 }
            );
        }

        // Get delivery fee based on area
        const serviceArea = await prisma.serviceArea.findFirst({
            where: { name: address.area, isActive: true },
        });

        if (!serviceArea) {
            return NextResponse.json(
                { message: 'المنطقة غير متاحة للتوصيل حالياً' },
                { status: 400 }
            );
        }

        // ATOMIC TRANSACTION: Create order and update stock together
        const order = await prisma.$transaction(async (tx) => {
            // Get products with fresh stock data inside transaction
            const productIds = items.map((item: { productId: string }) => item.productId);
            const products = await tx.product.findMany({
                where: { id: { in: productIds }, isActive: true },
                include: {
                    serviceAreas: {
                        include: {
                            serviceArea: true,
                        },
                    },
                },
            });

            if (products.length !== productIds.length) {
                throw new Error('بعض المنتجات غير متاحة');
            }

            // BACKEND VALIDATION: Verify all products serve the delivery area
            const deliveryAreaName = address.area;
            for (const product of products) {
                const servesArea = product.serviceAreas.some(
                    (psa) => psa.serviceArea.name === deliveryAreaName
                );

                if (!servesArea) {
                    throw new Error(
                        `المنتج "${product.name}" غير متوفر في منطقة "${deliveryAreaName}". يرجى اختيار عنوان توصيل آخر.`
                    );
                }
            }

            // Check stock and calculate subtotal
            let subtotal = 0;
            const orderItems = [];
            const stockUpdates = [];

            for (const item of items) {
                const product = products.find(p => p.id === item.productId);
                if (!product) {
                    throw new Error(`المنتج غير موجود`);
                }

                // Check stock availability inside transaction
                if (product.trackStock && product.stock < item.quantity) {
                    const availableStock = product.stock;
                    if (availableStock === 0) {
                        throw new Error(`نعتذر، المنتج "${product.name}" نفذت كميته من المخزون`);
                    } else {
                        throw new Error(`نعتذر، الكمية المتوفرة من "${product.name}" هي ${availableStock} فقط`);
                    }
                }

                const itemTotal = Number(product.price) * item.quantity;
                subtotal += itemTotal;

                orderItems.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: product.price,
                    total: itemTotal,
                    notes: item.notes,
                });

                // Prepare stock update
                if (product.trackStock) {
                    stockUpdates.push({
                        productId: item.productId,
                        quantity: item.quantity,
                    });
                }
            }

            const deliveryFee = Number(serviceArea.deliveryFee);
            const total = subtotal + deliveryFee;

            // Create order inside transaction
            const newOrder = await tx.order.create({
                data: {
                    orderNumber: generateOrderNumber(),
                    customerId: user.id,
                    addressId,
                    subtotal,
                    deliveryFee,
                    total,
                    notes,
                    items: {
                        create: orderItems,
                    },
                    statusHistory: {
                        create: {
                            status: 'PENDING',
                            notes: 'تم إنشاء الطلب',
                        },
                    },
                },
                include: {
                    items: {
                        include: { product: true },
                    },
                    address: true,
                },
            });

            // Update stock atomically inside same transaction
            for (const update of stockUpdates) {
                await tx.product.update({
                    where: { id: update.productId },
                    data: { stock: { decrement: update.quantity } },
                });
            }

            return newOrder;
        });

        // Send notifications and audit log AFTER successful transaction
        try {
            await notifyNewOrder(order.id, order.orderNumber);
        } catch (error) {
            console.error('Notification error:', error);
            // Don't fail the order if notification fails
        }

        try {
            await createAuditLog({
                userId: user.id,
                action: 'CREATE',
                entity: 'Order',
                entityId: order.id,
                newData: { orderNumber: order.orderNumber, total: order.total },
            });
        } catch (error) {
            console.error('Audit log error:', error);
            // Don't fail the order if audit log fails
        }

        return NextResponse.json({
            message: 'تم إنشاء الطلب بنجاح',
            order,
        }, { status: 201 });
    } catch (error) {
        console.error('Create order error:', error);
        return NextResponse.json(
            { message: 'حدث خطأ في إنشاء الطلب' },
            { status: 500 }
        );
    }
}
