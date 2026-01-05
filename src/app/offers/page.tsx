'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Tag, Clock, ArrowLeft, Calendar, Gift } from 'lucide-react';
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
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="container mx-auto px-4 py-12 max-w-7xl">
                {/* Minimal Professional Header */}
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-secondary-900 mb-3">
                        العروض الخاصة
                    </h1>
                    <p className="text-gray-600 text-lg">
                        اكتشف أفضل العروض والخصومات الحصرية
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-32">
                        <div className="spinner"></div>
                    </div>
                ) : offers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {offers.map((offer) => {
                            const daysLeft = getDaysLeft(offer.endDate);
                            const isPercentage = offer.discountType.toLowerCase() === 'percentage';

                            return (
                                <Link
                                    key={offer.id}
                                    href={`/offers/${offer.id}`}
                                    className="group block"
                                >
                                    <article className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                                        {/* Image Section - Professional & Clean */}
                                        <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                                            {offer.image ? (
                                                <Image
                                                    src={offer.image}
                                                    alt={offer.title}
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Gift className="w-24 h-24 text-gray-200" />
                                                </div>
                                            )}

                                            {/* Minimalist Discount Badge - Top Right */}
                                            <div className="absolute top-6 right-6">
                                                <div className="bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-lg border border-gray-100">
                                                    <div className="text-2xl font-black text-secondary-900 leading-none mb-1">
                                                        {formatDiscount(offer.discountType, offer.discountValue)}
                                                    </div>
                                                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                        خصم
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Gradient Overlay - Subtle */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
                                        </div>

                                        {/* Content Section */}
                                        <div className="p-8">
                                            <h3 className="text-2xl font-bold text-secondary-900 mb-3 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                                                {offer.title}
                                            </h3>

                                            {offer.description && (
                                                <p className="text-gray-600 text-base mb-6 line-clamp-2 leading-relaxed">
                                                    {offer.description}
                                                </p>
                                            )}

                                            {/* Time Indicator - Refined */}
                                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                                        <Clock className="w-5 h-5 text-gray-700" />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-gray-500 font-medium mb-0.5">
                                                            ينتهي خلال
                                                        </div>
                                                        <div className="text-lg font-bold text-secondary-900">
                                                            {daysLeft} {daysLeft === 1 ? 'يوم' : 'أيام'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* CTA - Professional */}
                                            <div className="flex items-center justify-between text-primary font-bold group/cta">
                                                <span className="text-base">استكشف العرض</span>
                                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover/cta:bg-primary group-hover/cta:text-white transition-all">
                                                    <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-32">
                        <div className="max-w-md mx-auto text-center">
                            <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
                                <Tag className="w-12 h-12 text-gray-300" />
                            </div>
                            <h3 className="text-3xl font-bold text-secondary-900 mb-4">
                                لا توجد عروض حالياً
                            </h3>
                            <p className="text-gray-600 text-lg mb-10">
                                ترقبوا أحدث العروض والخصومات الحصرية قريباً
                            </p>
                            <Link
                                href="/products"
                                className="btn btn-primary btn-lg inline-flex items-center gap-3"
                            >
                                <span>تصفح المنتجات</span>
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
