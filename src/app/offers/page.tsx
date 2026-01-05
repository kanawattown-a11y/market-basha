'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Tag, Clock, Percent, TrendingDown, Sparkles, ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Offer {
    id: string;
    title: string;
    description: string | null;
    image: string | null;
    discountType: string;
    discountValue: number;
    endDate: string;
    startDate: string;
}

export default function OffersPage() {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOffers();
    }, []);

    const fetchOffers = async () => {
        try {
            const res = await fetch('/api/offers?active=true');
            if (res.ok) {
                const data = await res.json();
                setOffers(data.offers);
            }
        } catch (error) {
            console.error('Error fetching offers:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDaysLeft = (endDate: string) => {
        const end = new Date(endDate);
        const now = new Date();
        const diff = end.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days > 0 ? days : 0;
    };

    const formatDiscount = (type: string, value: number) => {
        if (type.toLowerCase() === 'percentage') {
            return `${value}%`;
        }
        return `${value} ل.س`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <Header />
            <main className="container mx-auto px-4 py-8">
                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-yellow-400 to-primary p-8 md:p-12 mb-8 shadow-2xl">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.2),transparent)]"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-secondary-900/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                <Sparkles className="w-6 h-6 text-secondary-900" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-secondary-900">العروض والخصومات</h1>
                        </div>
                        <p className="text-secondary-800 text-lg font-medium max-w-2xl">
                            استمتع بأفضل العروض والخصومات الحصرية على مجموعة واسعة من المنتجات 🎉
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="spinner"></div>
                    </div>
                ) : offers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {offers.map((offer) => {
                            const daysLeft = getDaysLeft(offer.endDate);
                            const isPercentage = offer.discountType.toLowerCase() === 'percentage';

                            return (
                                <div
                                    key={offer.id}
                                    className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                                >
                                    {/* Discount Badge */}
                                    <div className="absolute top-4 right-4 z-20">
                                        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white px-4 py-2 rounded-xl shadow-lg transform rotate-3 group-hover:rotate-0 transition-transform">
                                            <div className="flex items-center gap-1 font-black text-lg">
                                                {isPercentage && <Percent className="w-5 h-5" />}
                                                <span>{formatDiscount(offer.discountType, offer.discountValue)}</span>
                                            </div>
                                            <div className="text-xs font-medium text-red-100">خصم</div>
                                        </div>
                                    </div>

                                    {/* Image Section */}
                                    <div className="relative h-48 bg-gradient-to-br from-primary/10 to-yellow-50 overflow-hidden">
                                        {offer.image ? (
                                            <Image
                                                src={offer.image}
                                                alt={offer.title}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Tag className="w-20 h-20 text-primary/20" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-secondary-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                            {offer.title}
                                        </h3>

                                        {offer.description && (
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                                {offer.description}
                                            </p>
                                        )}

                                        {/* Countdown */}
                                        <div className="flex items-center gap-2 mb-4 p-3 bg-gradient-to-r from-primary/10 to-yellow-50 rounded-xl">
                                            <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                                            <div>
                                                <div className="text-xs text-gray-500 font-medium">باقي على انتهاء العرض</div>
                                                <div className="text-lg font-black text-secondary-900">
                                                    {daysLeft > 0 ? `${daysLeft} ${daysLeft === 1 ? 'يوم' : 'أيام'}` : 'ينتهي قريباً!'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* CTA Button */}
                                        <Link
                                            href={`/offers/${offer.id}`}
                                            className="btn btn-primary w-full group/btn"
                                        >
                                            <span>استفد من العرض</span>
                                            <ArrowLeft className="w-4 h-4 group-hover/btn:-translate-x-1 transition-transform" />
                                        </Link>
                                    </div>

                                    {/* Decorative Corner */}
                                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-transparent rounded-tr-full"></div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="card p-12 text-center max-w-2xl mx-auto">
                        <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-yellow-100 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                            <Tag className="w-12 h-12 text-primary" />
                        </div>
                        <h3 className="text-2xl font-black text-secondary-800 mb-3">لا توجد عروض حالياً</h3>
                        <p className="text-gray-600 mb-8 text-lg">
                            ترقبوا أقوى العروض والخصومات الحصرية قريباً! 🎊
                        </p>
                        <Link href="/products" className="btn btn-primary btn-lg">
                            <TrendingDown className="w-5 h-5" />
                            تصفح المنتجات
                        </Link>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
