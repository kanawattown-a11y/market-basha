'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, Mail, Lock, Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react';
import Image from 'next/image';

// Syrian Phone Number Validation
// Format: +963 9XX XXX XXX (9 digits after 963)
function isValidSyrianPhone(phone: string): boolean {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');

    // Check if it's 9 digits and starts with 9
    if (digits.length === 9 && digits.startsWith('9')) {
        return true;
    }

    return false;
}

// Format phone for display: 912345678 -> 912 345 678
function formatPhoneDisplay(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length >= 3) {
        const parts = [];
        parts.push(digits.slice(0, 3));
        if (digits.length > 3) parts.push(digits.slice(3, 6));
        if (digits.length > 6) parts.push(digits.slice(6, 9));
        return parts.join(' ');
    }
    return digits;
}

export default function LoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        identifier: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Process phone number
            let digits = formData.identifier.replace(/\D/g, '');

            // Remove 963 if already present
            if (digits.startsWith('963')) {
                digits = digits.slice(3);
            }

            // Remove leading 0 if present
            if (digits.startsWith('0')) {
                digits = digits.slice(1);
            }

            // Add +963 prefix
            const phoneNumber = `+963${digits}`;

            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identifier: phoneNumber,
                    password: formData.password,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                router.push('/');
                router.refresh();
            } else {
                setError(data.message || 'خطأ في تسجيل الدخول');
            }
        } catch (error) {
            setError('حدث خطأ في الاتصال');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary-900/5 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="relative w-24 h-24 mx-auto mb-4">
                        <Image src="/logo.svg" alt="Market Basha" fill className="object-contain" />
                    </div>
                    <h1 className="text-3xl font-black text-secondary-900">تسجيل الدخول</h1>
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
                            <label htmlFor="identifier" className="block text-sm font-bold text-secondary-800 mb-2">
                                رقم الهاتف
                            </label>

                            <div className="relative">
                                {/* Fixed +963 Prefix - Left Side */}
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none select-none text-gray-500 font-bold bg-gray-50 px-2 py-1 rounded-md border border-gray-200" style={{ zIndex: 10 }}>
                                    <span className="text-sm" dir="ltr">+963</span>
                                </div>

                                <input
                                    id="identifier"
                                    type="text"
                                    value={formData.identifier}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        // Only allow digits to be typed
                                        if (/^\d*$/.test(value)) {
                                            setFormData({ ...formData, identifier: value });
                                        }
                                    }}
                                    className={`input text-center pl-24 pr-12 font-mono text-lg tracking-widest ${formData.identifier
                                        ? isValidSyrianPhone(formData.identifier)
                                            ? 'border-green-400 focus:border-green-500 focus:ring-green-500/20'
                                            : 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                                        : ''
                                        }`}
                                    placeholder="9XX XXX XXX"
                                    dir="ltr"
                                    maxLength={9}
                                    required
                                />

                                {/* Validation Icon - Right Side */}
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    {formData.identifier ? (
                                        isValidSyrianPhone(formData.identifier) ? (
                                            <div className="bg-green-100 p-1 rounded-full text-green-600 animate-in zoom-in duration-200">
                                                <Check className="w-4 h-4" />
                                            </div>
                                        ) : (
                                            <div className="bg-red-100 p-1 rounded-full text-red-600 animate-in zoom-in duration-200">
                                                <X className="w-4 h-4" />
                                            </div>
                                        )
                                    ) : (
                                        <div className="text-gray-400">
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Format Helper - Professional */}
                            {formData.identifier && (
                                <div className={`mt-2 p-3 rounded-xl text-sm ${isValidSyrianPhone(formData.identifier)
                                    ? 'bg-green-50 border border-green-200'
                                    : 'bg-amber-50 border border-amber-200'
                                    }`}>
                                    {isValidSyrianPhone(formData.identifier) ? (
                                        <div className="flex items-start gap-2 text-green-700">
                                            <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold">الصيغة صحيحة ✓</p>
                                                <p className="text-xs mt-1">الرقم: +963 {formatPhoneDisplay(formData.identifier)}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-start gap-2 text-amber-700">
                                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold">الصيغة الصحيحة للرقم السوري:</p>
                                                <p className="text-xs mt-1 font-mono">+963 9XX XXX XXX (9 أرقام)</p>
                                                <p className="text-xs mt-1">مثال: 912345678</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-bold text-secondary-800 mb-2">
                                كلمة المرور
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="input pl-12"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full"
                        >
                            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                            {!loading && <LogIn className="w-5 h-5 mr-2" />}
                        </button>

                        <div className="text-center text-sm text-gray-600">
                            ليس لديك حساب؟{' '}
                            <Link href="/register" className="text-primary font-bold hover:underline">
                                سجل الآن
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
