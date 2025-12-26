'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, UserPlus, Phone, Mail, Lock, User, MapPin } from 'lucide-react';

interface ServiceArea {
    id: string;
    name: string;
}

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        serviceAreaId: '',
    });
    const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Fetch service areas on mount
    useEffect(() => {
        const fetchAreas = async () => {
            try {
                const res = await fetch('/api/service-areas?active=true');
                if (res.ok) {
                    const data = await res.json();
                    setServiceAreas(data.areas || []);
                }
            } catch (e) {
                console.error('Error fetching service areas:', e);
            }
        };
        fetchAreas();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('كلمات المرور غير متطابقة');
            return;
        }

        if (!formData.serviceAreaId) {
            setError('يرجى اختيار منطقة التخديم');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email || undefined,
                    password: formData.password,
                    confirmPassword: formData.confirmPassword,
                    serviceAreaId: formData.serviceAreaId,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'حدث خطأ أثناء التسجيل');
                return;
            }

            setSuccess(true);
        } catch {
            setError('حدث خطأ في الاتصال');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                <div className="w-full max-w-md text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-secondary-800 mb-4">تم التسجيل بنجاح!</h2>
                    <p className="text-gray-500 mb-6">
                        شكراً لتسجيلك في ماركت باشا. سيتم مراجعة طلبك والموافقة عليه من قبل الإدارة.
                        سنقوم بإشعارك عند تفعيل حسابك.
                    </p>
                    <Link href="/login" className="btn btn-primary">
                        العودة لتسجيل الدخول
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <div className="relative w-20 h-20">
                            <Image src="/logo.svg" alt="Market Basha" fill className="object-contain" priority />
                        </div>
                    </Link>
                    <h1 className="text-3xl font-bold text-secondary-800 mt-4">إنشاء حساب جديد</h1>
                    <p className="text-gray-500 mt-2">انضم إلى ماركت باشا</p>
                </div>

                {/* Form Card */}
                <div className="card p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="label">الاسم الكامل</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input pl-12 text-right"
                                    placeholder="أدخل اسمك الكامل"
                                    required
                                    dir="auto"
                                />
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <User className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="label">رقم الهاتف</label>
                            <div className="relative">
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => {
                                        let val = e.target.value;
                                        // Auto-format for Syrian numbers
                                        if (val.startsWith('09')) val = '+963' + val.substring(1);
                                        if (val.startsWith('9')) val = '+963' + val;

                                        // Allow only + and digits
                                        val = val.replace(/[^\d+]/g, '');

                                        // Ensure it doesn't delete +963 easily if it's there? 
                                        // Actually just let the user edit, but the above rules help.

                                        setFormData({ ...formData, phone: val });
                                    }}
                                    className={`input pl-12 text-right ${formData.phone && !/^\+9639\d{8}$/.test(formData.phone)
                                        ? 'border-red-500 focus:border-red-500'
                                        : formData.phone && /^\+9639\d{8}$/.test(formData.phone)
                                            ? 'border-green-500 focus:border-green-500'
                                            : ''
                                        }`}
                                    placeholder="+9639xxxxxxxx"
                                    required
                                    dir="ltr"
                                />
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Phone className="w-5 h-5" />
                                </div>
                            </div>
                            {formData.phone && !/^\+9639\d{8}$/.test(formData.phone) && (
                                <p className="text-xs text-red-500 mt-1 mr-1">
                                    يجب أن يكون الرقم بالصيغة السورية الصحيحة (+9639xxxxxxxx)
                                </p>
                            )}
                            {formData.phone && /^\+9639\d{8}$/.test(formData.phone) && (
                                <p className="text-xs text-green-600 mt-1 mr-1">
                                    صيغة الرقم صحيحة
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="label">منطقة التخديم *</label>
                            <div className="relative">
                                <select
                                    value={formData.serviceAreaId}
                                    onChange={(e) => setFormData({ ...formData, serviceAreaId: e.target.value })}
                                    className="input pl-12 text-right appearance-none"
                                    required
                                >
                                    <option value="">اختر منطقتك</option>
                                    {serviceAreas.map(area => (
                                        <option key={area.id} value={area.id}>{area.name}</option>
                                    ))}
                                </select>
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <MapPin className="w-5 h-5" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 mr-1">
                                ستظهر لك المنتجات المتوفرة في منطقتك فقط
                            </p>
                        </div>

                        <div>
                            <label className="label">البريد الإلكتروني (اختياري)</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="input pl-12 text-right"
                                    placeholder="example@email.com"
                                    dir="ltr"
                                />
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Mail className="w-5 h-5" />
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
                                    className="input pl-12 text-right"
                                    placeholder="8 أحرف على الأقل"
                                    required
                                    minLength={8}
                                    dir="auto"
                                />
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            {/* Password Strength Meter */}
                            {formData.password && (
                                <div className="mt-2 space-y-1">
                                    <div className="flex gap-1 h-1.5">
                                        {[1, 2, 3, 4].map((level) => {
                                            const score =
                                                (formData.password.length >= 8 ? 1 : 0) +
                                                (/[A-Z]/.test(formData.password) ? 1 : 0) +
                                                (/[0-9]/.test(formData.password) ? 1 : 0) +
                                                (/[^A-Za-z0-9]/.test(formData.password) ? 1 : 0);

                                            let color = 'bg-gray-200';
                                            if (score >= 1) color = 'bg-red-500';
                                            if (score >= 3) color = 'bg-yellow-500';
                                            if (score >= 4) color = 'bg-green-500';

                                            const isActive = score >= level;

                                            // Simplified logic for individual bars based on total score
                                            let barColor = 'bg-gray-200';
                                            if (score <= 2) {
                                                if (level <= score && level <= 2) barColor = 'bg-red-500';
                                            } else if (score === 3) {
                                                if (level <= 3) barColor = 'bg-yellow-500';
                                            } else {
                                                barColor = 'bg-green-500';
                                            }

                                            if (!isActive) barColor = 'bg-gray-200';

                                            return (
                                                <div key={level} className={`flex-1 rounded-full ${barColor} transition-all duration-300`} />
                                            );
                                        })}
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400">قوة كلمة المرور</span>
                                        {(() => {
                                            const score =
                                                (formData.password.length >= 8 ? 1 : 0) +
                                                (/[A-Z]/.test(formData.password) ? 1 : 0) +
                                                (/[0-9]/.test(formData.password) ? 1 : 0) +
                                                (/[^A-Za-z0-9]/.test(formData.password) ? 1 : 0);

                                            if (score < 2) return <span className="text-red-500">ضعيفة</span>;
                                            if (score < 4) return <span className="text-yellow-500">متوسطة</span>;
                                            return <span className="text-green-500">قوية</span>;
                                        })()}
                                    </div>
                                </div>
                            )}

                            <p className="text-xs text-gray-400 mt-1">
                                يجب أن تحتوي على حرف كبير وصغير ورقم
                            </p>
                        </div>

                        <div>
                            <label className="label">تأكيد كلمة المرور</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="input pl-12 text-right"
                                    placeholder="أعد إدخال كلمة المرور"
                                    required
                                    dir="auto"
                                />
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                                    <UserPlus className="w-5 h-5" />
                                    إنشاء الحساب
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-500">
                            لديك حساب؟{' '}
                            <Link href="/login" className="text-primary font-semibold hover:underline">
                                سجل دخولك
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="text-center text-gray-400 text-sm mt-6">
                    بإنشاء حساب فإنك توافق على{' '}
                    <Link href="/terms" className="text-primary hover:underline">شروط الاستخدام</Link>
                    {' '}و{' '}
                    <Link href="/privacy" className="text-primary hover:underline">سياسة الخصوصية</Link>
                </p>
            </div>
        </div>
    );
}
