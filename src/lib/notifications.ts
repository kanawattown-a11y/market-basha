import { prisma } from './prisma';
import { NotificationType } from '@prisma/client';
import { sendToDevice, sendToDevices, sendToTopic, subscribeToTopic, isFirebaseConfigured, FCMNotificationPayload } from './firebase-admin';

// إرسال إشعار Push لمستخدم معين عبر Firebase
export async function sendPushNotification(
    userId: string,
    payload: FCMNotificationPayload
): Promise<void> {
    if (!isFirebaseConfigured()) {
        console.log('Firebase not configured, skipping push notification');
        return;
    }

    try {
        // Get user's FCM tokens
        const subscriptions = await prisma.pushSubscription.findMany({
            where: { userId },
        });

        if (subscriptions.length === 0) return;

        const tokens = subscriptions.map(sub => sub.endpoint); // endpoint stores FCM token

        const result = await sendToDevices(tokens, payload);

        // Clean up invalid tokens
        if (result.invalidTokens.length > 0) {
            await prisma.pushSubscription.deleteMany({
                where: {
                    endpoint: { in: result.invalidTokens },
                },
            });
        }
    } catch (error) {
        console.error('Error sending push notification:', error);
    }
}

// إرسال إشعار لجميع المستخدمين بدور معين
export async function sendPushToRole(
    role: 'ADMIN' | 'OPERATIONS' | 'DRIVER' | 'USER',
    payload: FCMNotificationPayload
): Promise<void> {
    // استخدام Topic للأداء الأفضل
    const topic = `role_${role.toLowerCase()}`;
    await sendToTopic(topic, payload);
}

// إنشاء إشعار في قاعدة البيانات وإرساله كـ Push
export async function createAndSendNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, unknown>
): Promise<void> {
    // إنشاء الإشعار في قاعدة البيانات
    await prisma.notification.create({
        data: {
            userId,
            type,
            title,
            message,
            data: data as object | undefined,
        },
    });

    // إرسال Push Notification عبر Firebase
    await sendPushNotification(userId, {
        title,
        body: message,
        data: data ? Object.fromEntries(
            Object.entries(data).map(([k, v]) => [k, String(v)])
        ) : undefined,
    });
}

// إشعارات الطلبات
export async function notifyOrderStatusChange(
    orderId: string,
    status: string,
    customerId: string,
    driverId?: string | null
): Promise<void> {
    const statusMessages: Record<string, string> = {
        CONFIRMED: 'تم تأكيد طلبك وسيتم تجهيزه قريباً',
        PREPARING: 'جاري تجهيز طلبك',
        READY: 'طلبك جاهز للتوصيل',
        OUT_FOR_DELIVERY: 'طلبك في الطريق إليك',
        DELIVERED: 'تم توصيل طلبك بنجاح',
        CANCELLED: 'تم إلغاء طلبك',
    };

    const message = statusMessages[status] || `تم تحديث حالة طلبك إلى ${status}`;

    // إشعار العميل
    await createAndSendNotification(
        customerId,
        'ORDER_STATUS',
        'تحديث الطلب',
        message,
        { orderId }
    );

    // إشعار السائق عند التعيين
    if (driverId && status === 'OUT_FOR_DELIVERY') {
        await createAndSendNotification(
            driverId,
            'DRIVER_ASSIGNED',
            'طلب جديد',
            'تم تعيينك لتوصيل طلب جديد',
            { orderId }
        );
    }
}

// إشعار نفاذ المخزون
export async function notifyLowStock(
    productId: string,
    productName: string,
    currentStock: number
): Promise<void> {
    // إرسال لجميع Operations
    await sendPushToRole('OPERATIONS', {
        title: 'تنبيه المخزون',
        body: `المنتج "${productName}" على وشك النفاذ (${currentStock} فقط)`,
        data: { productId },
    });

    // حفظ في قاعدة البيانات
    const operationsUsers = await prisma.user.findMany({
        where: { role: 'OPERATIONS', status: 'APPROVED' },
    });

    for (const user of operationsUsers) {
        await prisma.notification.create({
            data: {
                userId: user.id,
                type: 'LOW_STOCK',
                title: 'تنبيه المخزون',
                message: `المنتج "${productName}" على وشك النفاذ (${currentStock} فقط)`,
                data: { productId },
            },
        });
    }
}

// إشعار طلب جديد
export async function notifyNewOrder(
    orderId: string,
    orderNumber: string
): Promise<void> {
    // إرسال لجميع Operations عبر Topic
    await sendPushToRole('OPERATIONS', {
        title: 'طلب جديد 🛒',
        body: `تم استلام طلب جديد رقم ${orderNumber}`,
        data: { orderId },
        clickAction: `/operations/orders/${orderId}`,
    });

    // حفظ في قاعدة البيانات
    const operationsUsers = await prisma.user.findMany({
        where: { role: 'OPERATIONS', status: 'APPROVED' },
    });

    for (const user of operationsUsers) {
        await prisma.notification.create({
            data: {
                userId: user.id,
                type: 'NEW_ORDER',
                title: 'طلب جديد',
                message: `تم استلام طلب جديد رقم ${orderNumber}`,
                data: { orderId },
            },
        });
    }
}

// إشعار مستخدم جديد للأدمن
export async function notifyNewUser(
    userId: string,
    userName: string
): Promise<void> {
    await sendPushToRole('ADMIN', {
        title: 'مستخدم جديد 👤',
        body: `قام ${userName} بالتسجيل ويحتاج للموافقة`,
        data: { userId },
        clickAction: `/admin/users/${userId}`,
    });

    const admins = await prisma.user.findMany({
        where: { role: 'ADMIN', status: 'APPROVED' },
    });

    for (const admin of admins) {
        await prisma.notification.create({
            data: {
                userId: admin.id,
                type: 'NEW_USER',
                title: 'مستخدم جديد',
                message: `قام ${userName} بالتسجيل ويحتاج للموافقة`,
                data: { userId },
            },
        });
    }
}

// إشعار تحديث التذكرة
export async function notifyTicketUpdate(
    ticketId: string,
    userId: string,
    message: string
): Promise<void> {
    await createAndSendNotification(
        userId,
        'TICKET_UPDATE',
        'تحديث التذكرة',
        message,
        { ticketId }
    );
}

// تسجيل المستخدم في Topic حسب دوره
export async function registerUserToRoleTopic(
    fcmToken: string,
    role: string
): Promise<void> {
    const topic = `role_${role.toLowerCase()}`;
    await subscribeToTopic([fcmToken], topic);
}
