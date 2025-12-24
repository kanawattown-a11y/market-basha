'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Save, Eye, EyeOff, AlertCircle, ChevronLeft } from 'lucide-react';

export default function EditProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [user, setUser] = useState({ name: '', email: '', phone: '' });
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    setUser({
                        name: data.user.name,
                        email: data.user.email || '',
                        phone: data.user.phone,
                    });
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/auth/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: user.name, email: user.email }),
            });

            if (res.ok) {
                setSuccess('تم حفظ التغييرات');
            } else {
                const data = await res.json();
                setError(data.message || 'حدث خطأ');
            }
        } catch {
            setError('حدث خطأ في الاتصال');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            setError('كلمات المرور غير متطابقة');
            return;
        }

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/auth/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwords.current,
                    newPassword: passwords.new,
                }),
            });

            if (res.ok) {
                setSuccess('تم تغيير كلمة المرور');
                setPasswords({ current: '', new: '', confirm: '' });
            } else {
                const data = await res.json();
                setError(data.message || 'حدث خطأ');
            }
        } catch {
            setError('حدث خطأ في الاتصال');
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
            <div className="flex items-center gap-4">
                <Link href="/account" className="text-gray-400 hover:text-gray-600">
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-2xl font-bold text-secondary-800">تعديل الملف الشخصي</h1>
            </div>

            {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm">
                    {success}
                </div>
            )}

            <div className="card p-6">
                <h3 className="font-bold text-secondary-800 mb-4">المعلومات الأساسية</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
                        <input
                            type="text"
                            value={user.name}
                            onChange={(e) => setUser({ ...user, name: e.target.value })}
                            className="input"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                        <input
                            type="email"
                            value={user.email}
                            onChange={(e) => setUser({ ...user, email: e.target.value })}
                            className="input"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                        <input
                            type="text"
                            value={user.phone}
                            className="input bg-gray-100"
                            disabled
                        />
                        <p className="text-xs text-gray-400 mt-1">لا يمكن تغيير رقم الهاتف</p>
                    </div>
                    <button type="submit" disabled={saving} className="btn btn-primary">
                        {saving ? <div className="spinner"></div> : <><Save className="w-5 h-5" /> حفظ التغييرات</>}
                    </button>
                </form>
            </div>

            <div className="card p-6">
                <h3 className="font-bold text-secondary-800 mb-4">تغيير كلمة المرور</h3>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور الحالية</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={passwords.current}
                            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                            className="input pr-10"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور الجديدة</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={passwords.new}
                            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                            className="input"
                            minLength={8}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">تأكيد كلمة المرور</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={passwords.confirm}
                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                            className="input"
                            required
                        />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                            type="checkbox"
                            checked={showPassword}
                            onChange={(e) => setShowPassword(e.target.checked)}
                        />
                        إظهار كلمات المرور
                    </label>
                    <button type="submit" disabled={saving} className="btn btn-outline">
                        تغيير كلمة المرور
                    </button>
                </form>
            </div>
        </div>
    );
}
