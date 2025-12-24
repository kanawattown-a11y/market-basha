'use client';

import { Bell, Lock } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamic import to prevent SSR issues with push notifications
const PushNotificationButton = dynamic(
    () => import('@/components/PushNotificationButton'),
    { ssr: false }
);

export default function AccountSettingsPage() {
    return (
        <div className="space-y-4 md:space-y-6">
            <h1 className="text-xl md:text-2xl font-bold text-secondary-800">الإعدادات</h1>

            {/* إعدادات الإشعارات */}
            <div className="card p-4 md:p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Bell className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="font-bold text-secondary-800">إشعارات Push</h2>
                        <p className="text-sm text-gray-500">تلقي إشعارات فورية على جهازك</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* زر تفعيل/إلغاء الإشعارات الفعلي */}
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <p className="font-medium text-secondary-800">إشعارات المتصفح</p>
                                <p className="text-sm text-gray-500">
                                    تنبيهات فورية للطلبات والتحديثات
                                </p>
                            </div>
                            <PushNotificationButton />
                        </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-xl">
                        <p className="text-sm text-blue-700">
                            💡 <strong>ملاحظة:</strong> عند تفعيل الإشعارات ستتلقى تنبيهات حول:
                        </p>
                        <ul className="text-sm text-blue-600 mt-2 mr-4 list-disc">
                            <li>تحديثات حالة الطلبات</li>
                            <li>العروض والتخفيضات الجديدة</li>
                            <li>رسائل الدعم الفني</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* إعدادات الأمان */}
            <div className="card p-4 md:p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                        <Lock className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <h2 className="font-bold text-secondary-800">الخصوصية والأمان</h2>
                        <p className="text-sm text-gray-500">إعدادات الأمان</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <button className="w-full text-right p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <p className="font-medium text-secondary-800">تغيير كلمة المرور</p>
                        <p className="text-sm text-gray-500">قم بتحديث كلمة المرور الخاصة بك</p>
                    </button>

                    <button className="w-full text-right p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors">
                        <p className="font-medium text-red-600">حذف الحساب</p>
                        <p className="text-sm text-red-400">حذف حسابك وجميع بياناتك نهائياً</p>
                    </button>
                </div>
            </div>
        </div>
    );
}
