'use client';

import { useState, useEffect } from 'react';
import { Settings, DollarSign, Save } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface SystemSettings {
    extraStoreFeePerStore: number;
}

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<SystemSettings>({
        extraStoreFeePerStore: 5000
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            if (res.ok) {
                const data = await res.json();
                setSettings(data);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage('');
        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });

            if (res.ok) {
                setMessage('✅ تم حفظ الإعدادات بنجاح');
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage('❌ فشل الحفظ');
            }
        } catch (error) {
            setMessage('❌ خطأ في الاتصال');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="spinner mx-auto"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-secondary-800">الإعدادات</h1>
                <p className="text-gray-500">إعدادات النظام العامة</p>
            </div>

            {message && (
                <div className={`card p-4 ${message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message}
                </div>
            )}

            <div className="card p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="font-bold text-secondary-800">الإعدادات المالية</h2>
                        <p className="text-sm text-gray-500">رسوم التوصيل والخدمات</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="label">رسوم المتجر الإضافي</label>
                        <p className="text-xs text-gray-500 mb-2">
                            المبلغ المضاف لكل متجر إضافي عند الشراء من متاجر متعددة
                        </p>
                        <div className="flex gap-3 items-center">
                            <input
                                type="number"
                                value={settings.extraStoreFeePerStore}
                                onChange={(e) => setSettings({ ...settings, extraStoreFeePerStore: parseFloat(e.target.value) })}
                                className="input flex-1"
                                min="0"
                                step="500"
                            />
                            <span className="text-gray-600">ل.س</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            القيمة الحالية: {formatCurrency(settings.extraStoreFeePerStore)}
                        </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">💡 مثال على الحساب</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• شراء من متجر واحد = 0 ل.س إضافية</li>
                            <li>• شراء من متجرين = {formatCurrency(settings.extraStoreFeePerStore)} إضافية</li>
                            <li>• شراء من 3 متاجر = {formatCurrency(settings.extraStoreFeePerStore * 2)} إضافية</li>
                        </ul>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn btn-primary"
                    >
                        {saving ? (
                            <>
                                <div className="spinner border-white"></div>
                                جاري الحفظ...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                حفظ الإعدادات
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
