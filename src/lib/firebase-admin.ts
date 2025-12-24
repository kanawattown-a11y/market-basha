import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
let firebaseApp: admin.app.App | null = null;

function getFirebaseAdmin() {
    if (firebaseApp) {
        return firebaseApp;
    }

    // Check if service account is configured
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

    if (!serviceAccount) {
        console.warn('Firebase service account not configured');
        return null;
    }

    try {
        const parsedServiceAccount = JSON.parse(serviceAccount);

        firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(parsedServiceAccount),
        });

        return firebaseApp;
    } catch (error) {
        console.error('Failed to initialize Firebase:', error);
        return null;
    }
}

export interface FCMNotificationPayload {
    title: string;
    body: string;
    icon?: string;
    image?: string;
    data?: Record<string, string>;
    clickAction?: string;
}

// إرسال إشعار لجهاز واحد
export async function sendToDevice(
    fcmToken: string,
    payload: FCMNotificationPayload
): Promise<boolean> {
    const app = getFirebaseAdmin();
    if (!app) return false;

    try {
        await admin.messaging().send({
            token: fcmToken,
            notification: {
                title: payload.title,
                body: payload.body,
                imageUrl: payload.image,
            },
            data: payload.data,
            webpush: {
                notification: {
                    icon: payload.icon || '/icons/icon-192x192.png',
                    badge: '/icons/badge-72x72.png',
                    dir: 'rtl',
                    lang: 'ar',
                },
                fcmOptions: {
                    link: payload.clickAction || '/',
                },
            },
            android: {
                notification: {
                    icon: 'ic_notification',
                    color: '#4CAF50',
                    clickAction: payload.clickAction,
                },
                priority: 'high',
            },
            apns: {
                payload: {
                    aps: {
                        badge: 1,
                        sound: 'default',
                    },
                },
            },
        });

        return true;
    } catch (error: unknown) {
        console.error('FCM send error:', error);

        // If token is invalid, return false to allow cleanup
        if (error && typeof error === 'object' && 'code' in error) {
            const fcmError = error as { code: string };
            if (fcmError.code === 'messaging/invalid-registration-token' ||
                fcmError.code === 'messaging/registration-token-not-registered') {
                return false;
            }
        }

        return false;
    }
}

// إرسال إشعار لعدة أجهزة
export async function sendToDevices(
    fcmTokens: string[],
    payload: FCMNotificationPayload
): Promise<{ success: number; failure: number; invalidTokens: string[] }> {
    const app = getFirebaseAdmin();
    if (!app) {
        return { success: 0, failure: fcmTokens.length, invalidTokens: [] };
    }

    const invalidTokens: string[] = [];
    let success = 0;
    let failure = 0;

    // Firebase لا يدعم إرسال لأكثر من 500 جهاز دفعة واحدة
    const batchSize = 500;

    for (let i = 0; i < fcmTokens.length; i += batchSize) {
        const batch = fcmTokens.slice(i, i + batchSize);

        try {
            const response = await admin.messaging().sendEachForMulticast({
                tokens: batch,
                notification: {
                    title: payload.title,
                    body: payload.body,
                    imageUrl: payload.image,
                },
                data: payload.data,
                webpush: {
                    notification: {
                        icon: payload.icon || '/icons/icon-192x192.png',
                        badge: '/icons/badge-72x72.png',
                        dir: 'rtl',
                        lang: 'ar',
                    },
                },
            });

            success += response.successCount;
            failure += response.failureCount;

            // Collect invalid tokens
            response.responses.forEach((resp, idx) => {
                if (!resp.success && resp.error) {
                    const code = resp.error.code;
                    if (code === 'messaging/invalid-registration-token' ||
                        code === 'messaging/registration-token-not-registered') {
                        invalidTokens.push(batch[idx]);
                    }
                }
            });
        } catch (error) {
            console.error('FCM batch send error:', error);
            failure += batch.length;
        }
    }

    return { success, failure, invalidTokens };
}

// إرسال إشعار لموضوع (Topic)
export async function sendToTopic(
    topic: string,
    payload: FCMNotificationPayload
): Promise<boolean> {
    const app = getFirebaseAdmin();
    if (!app) return false;

    try {
        await admin.messaging().send({
            topic,
            notification: {
                title: payload.title,
                body: payload.body,
                imageUrl: payload.image,
            },
            data: payload.data,
            webpush: {
                notification: {
                    icon: payload.icon || '/icons/icon-192x192.png',
                    badge: '/icons/badge-72x72.png',
                    dir: 'rtl',
                    lang: 'ar',
                },
            },
        });

        return true;
    } catch (error) {
        console.error('FCM topic send error:', error);
        return false;
    }
}

// اشتراك المستخدم في موضوع
export async function subscribeToTopic(
    fcmTokens: string[],
    topic: string
): Promise<boolean> {
    const app = getFirebaseAdmin();
    if (!app) return false;

    try {
        await admin.messaging().subscribeToTopic(fcmTokens, topic);
        return true;
    } catch (error) {
        console.error('FCM subscribe to topic error:', error);
        return false;
    }
}

// إلغاء اشتراك من موضوع
export async function unsubscribeFromTopic(
    fcmTokens: string[],
    topic: string
): Promise<boolean> {
    const app = getFirebaseAdmin();
    if (!app) return false;

    try {
        await admin.messaging().unsubscribeFromTopic(fcmTokens, topic);
        return true;
    } catch (error) {
        console.error('FCM unsubscribe from topic error:', error);
        return false;
    }
}

// تصدير للتحقق من الإعداد
export function isFirebaseConfigured(): boolean {
    return !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
}
