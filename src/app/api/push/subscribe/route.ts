import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { registerUserToRoleTopic } from '@/lib/notifications';

// POST /api/push/subscribe - Subscribe to push notifications with FCM token
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
        const { token } = body; // FCM Token

        if (!token) {
            return NextResponse.json(
                { message: 'FCM token مطلوب' },
                { status: 400 }
            );
        }

        // Check if subscription already exists
        const existing = await prisma.pushSubscription.findUnique({
            where: { endpoint: token },
        });

        if (existing) {
            // Update if exists
            await prisma.pushSubscription.update({
                where: { endpoint: token },
                data: { userId: user.id },
            });
        } else {
            // Create new subscription
            await prisma.pushSubscription.create({
                data: {
                    userId: user.id,
                    endpoint: token, // Store FCM token in endpoint field
                    p256dh: 'fcm', // Placeholder for FCM
                    auth: 'fcm', // Placeholder for FCM
                },
            });
        }

        // Subscribe user to role-based topic
        await registerUserToRoleTopic(token, user.role);

        return NextResponse.json({
            message: 'تم تفعيل الإشعارات بنجاح',
        });
    } catch (error) {
        console.error('Push subscribe error:', error);
        return NextResponse.json(
            { message: 'حدث خطأ في تفعيل الإشعارات' },
            { status: 500 }
        );
    }
}

// DELETE /api/push/subscribe - Unsubscribe from push notifications
export async function DELETE(request: NextRequest) {
    try {
        const user = await getSession();

        if (!user) {
            return NextResponse.json(
                { message: 'يجب تسجيل الدخول' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (token) {
            await prisma.pushSubscription.deleteMany({
                where: { endpoint: token, userId: user.id },
            });
        } else {
            // Delete all subscriptions for this user
            await prisma.pushSubscription.deleteMany({
                where: { userId: user.id },
            });
        }

        return NextResponse.json({
            message: 'تم إلغاء الإشعارات',
        });
    } catch (error) {
        console.error('Push unsubscribe error:', error);
        return NextResponse.json(
            { message: 'حدث خطأ' },
            { status: 500 }
        );
    }
}
