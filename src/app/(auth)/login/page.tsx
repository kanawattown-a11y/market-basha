'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn, Phone, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        identifier: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'حدث خطأ أثناء تسجيل الدخول');
                return;
            }

            // Redirect based on role
            if (data.user.role === 'ADMIN') {
                router.push('/admin');
            } else if (data.user.role === 'OPERATIONS') {
                router.push('/operations');
            } else if (data.user.role === 'DRIVER') {
                router.push('/driver');
            } else {
                router.push('/');
            }
        } catch {
            setError('حدث خطأ في الاتصال');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                            <span className="text-secondary font-bold text-3xl">م</span>
                        </div>
                    </Link>
                    <h1 className="text-3xl font-bold text-secondary-800 mt-4">تسجيل الدخول</h1>
                    <p className="text-gray-500 mt-2">مرحباً بك في ماركت باشا</p>
                </div>

                {/* Form Card */}
                <div className="card p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="label">رقم الهاتف أو البريد الإلكتروني</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={formData.identifier}
                                    onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                                    className="input pr-12"
                                    placeholder="أدخل رقم الهاتف أو البريد"
                                    required
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Phone className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="label">كلمة المرور</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="input pr-12"
                                    placeholder="أدخل كلمة المرور"
                                    required
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full btn-lg"
                        >
                            {loading ? (
                                <div className="spinner" />
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    تسجيل الدخول
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-500">
                            ليس لديك حساب؟{' '}
                            <Link href="/register" className="text-primary font-semibold hover:underline">
                                سجل الآن
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="text-center text-gray-400 text-sm mt-6">
                    بتسجيل دخولك فإنك توافق على{' '}
                    <Link href="/terms" className="text-primary hover:underline">شروط الاستخدام</Link>
                    {' '}و{' '}
                    <Link href="/privacy" className="text-primary hover:underline">سياسة الخصوصية</Link>
                </p>
            </div>
        </div>
    );
}
