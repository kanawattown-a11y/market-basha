import { Settings } from 'lucide-react';

export default function AdminSettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-secondary-800">الإعدادات</h1>
                <p className="text-gray-500">إعدادات النظام العامة</p>
            </div>

            <div className="card p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Settings className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="font-bold text-secondary-800">إعدادات المتجر</h2>
                        <p className="text-sm text-gray-500">تخصيص إعدادات المتجر</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                اسم المتجر
                            </label>
                            <input type="text" defaultValue="ماركت باشا" className="input" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                رقم الهاتف
                            </label>
                            <input type="text" defaultValue="+963912345678" className="input" dir="ltr" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                البريد الإلكتروني
                            </label>
                            <input type="email" defaultValue="info@marketbasha.com" className="input" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                العملة
                            </label>
                            <input type="text" defaultValue="ل.س" className="input" disabled />
                        </div>
                    </div>

                    <hr />

                    <div>
                        <h3 className="font-semibold text-secondary-800 mb-4">إعدادات الطلبات</h3>
                        <div className="space-y-4">
                            <label className="flex items-center gap-3">
                                <input type="checkbox" defaultChecked />
                                <span className="text-sm text-gray-700">تفعيل الطلبات الجديدة</span>
                            </label>
                            <label className="flex items-center gap-3">
                                <input type="checkbox" defaultChecked />
                                <span className="text-sm text-gray-700">إشعار الإدارة بالطلبات الجديدة</span>
                            </label>
                            <label className="flex items-center gap-3">
                                <input type="checkbox" defaultChecked />
                                <span className="text-sm text-gray-700">التحقق من المخزون عند الطلب</span>
                            </label>
                        </div>
                    </div>

                    <button className="btn btn-primary">
                        حفظ الإعدادات
                    </button>
                </div>
            </div>
        </div>
    );
}
