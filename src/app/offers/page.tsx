'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Tag, Clock, ArrowLeft, Sparkles, Zap } from 'lucide-react';
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5">
            <Header />
            <main className="container mx-auto px-4 py-12 max-w-7xl">
                {/* Elegant Header */}
                <div className="mb-16 text-center">
                    <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm px-6 py-2 rounded-full mb-6 border border-primary/20">
                        <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                        <span className="text-primary font-bold text-sm">عروض حصرية</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-secondary-900 mb-4 bg-gradient-to-r from-secondary-900 via-secondary-800 to-secondary-900 bg-clip-text">
                        العروض الخاصة
                    </h1>
                    <p className="text-gray-600 text-xl max-w-2xl mx-auto">
                        اكتشف أفضل العروض والخصومات الحصرية لدينا
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

                            return (
                                <Link
                                    key={offer.id}
                                    href={`/offers/${offer.id}`}
                                    className="group block"
                                >
                                    <article className="relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                                        {/* Premium Gradient Border Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-400 to-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"
                                            style={{ padding: '3px' }}>
                                            <div className="absolute inset-[3px] bg-white rounded-3xl"></div>
                                        </div>

                                        {/* Image Section */}
                                        <div className="relative aspect-[4/3] overflow-hidden">
                                            {/* Animated Gradient Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary-900/30 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                            {offer.image ? (
                                                <Image
                                                    src={offer.image}
                                                    alt={offer.title}
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-yellow-500/20 flex items-center justify-center">
                                                    <Tag className="w-32 h-32 text-primary/40" />
                                                </div>
                                            )}

                                            {/* Premium Discount Badge */}
                                            <div className="absolute top-6 right-6 z-20">
                                                <div className="relative">
                                                    {/* Glow Effect */}
                                                    <div className="absolute inset-0 bg-primary blur-xl opacity-60 animate-pulse"></div>

                                                    {/* Badge */}
                                                    <div className="relative bg-gradient-to-br from-primary via-yellow-400 to-yellow-600 px-6 py-4 rounded-2xl shadow-2xl transform group-hover:rotate-3 transition-transform duration-300">
                                                        <div className="flex items-center gap-2">
                                                            <Zap className="w-5 h-5 text-secondary-900 animate-pulse" />
                                                            <div>
                                                                <div className="text-3xl font-black text-secondary-900 leading-none">
                                                                    {formatDiscount(offer.discountType, offer.discountValue)}
                                                                </div>
                                                                <div className="text-xs font-bold text-secondary-800 uppercase tracking-wider">
                                                                    خصم
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Corner Accent */}
                                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-primary/30 to-transparent transform -translate-x-16 translate-y-16 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500"></div>
                                        </div>

                                        {/* Content Section */}
                                        <div className="relative p-8 z-10">
                                            <h3 className="text-2xl font-black text-secondary-900 mb-3 line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-300">
                                                {offer.title}
                                            </h3>

                                            {offer.description && (
                                                <p className="text-gray-600 text-base mb-6 line-clamp-2 leading-relaxed">
                                                    {offer.description}
                                                </p>
                                            )}

                                            {/* Timer - Premium Design */}
                                            <div className="relative mb-6 overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-2xl"></div>
                                                <div className="relative flex items-center justify-between p-5 bg-gradient-to-r from-primary/5 to-yellow-500/5 rounded-2xl border border-primary/20">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative">
                                                            <div className="absolute inset-0 bg-primary/20 blur-md rounded-xl"></div>
                                                            <div className="relative w-12 h-12 bg-gradient-to-br from-primary to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                                                                <Clock className="w-6 h-6 text-secondary-900" />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-gray-500 font-semibold mb-1">
                                                                ينتهي خلال
                                                            </div>
                                                            <div className="text-2xl font-black bg-gradient-to-r from-secondary-900 to-secondary-700 bg-clip-text text-transparent">
                                                                {daysLeft} {daysLeft === 1 ? 'يوم' : 'أيام'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* CTA Button - Premium */}
                                            <div className="relative group/btn">
                                                <div className="absolute inset-0 bg-gradient-to-r from-primary via-yellow-400 to-yellow-600 rounded-2xl blur opacity-50 group-hover/btn:opacity-75 transition-opacity"></div>
                                                <div className="relative flex items-center justify-center gap-3 bg-gradient-to-r from-secondary-900 to-secondary-800 text-white px-8 py-4 rounded-2xl font-bold text-lg group-hover/btn:from-primary group-hover/btn:to-yellow-500 group-hover/btn:text-secondary-900 transition-all duration-300 shadow-xl">
                                                    <span>استكشف العرض</span>
                                                    <ArrowLeft className="w-5 h-5 transition-transform group-hover/btn:-translate-x-2 duration-300" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Decorative Elements */}
                                        <div className="absolute top-1/2 right-0 w-40 h-40 bg-gradient-to-br from-primary/10 to-transparent rounded-full transform translate-x-20 -translate-y-20 group-hover:translate-x-10 transition-transform duration-500"></div>
                                    </article>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-32">
                        <div className="max-w-md mx-auto text-center">
                            <div className="relative mb-8">
                                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
                                <div className="relative w-32 h-32 bg-gradient-to-br from-primary/20 to-yellow-500/10 rounded-3xl flex items-center justify-center mx-auto">
                                    <Tag className="w-16 h-16 text-primary/60" />
                                </div>
                            </div>
                            <h3 className="text-4xl font-black text-secondary-900 mb-4">
                                لا توجد عروض حالياً
                            </h3>
                            <p className="text-gray-600 text-lg mb-10">
                                ترقبوا أحدث العروض والخصومات الحصرية قريباً
                            </p>
                            <Link
                                href="/products"
                                className="inline-flex items-center gap-3 bg-gradient-to-r from-secondary-900 to-secondary-800 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:from-primary hover:to-yellow-500 hover:text-secondary-900 transition-all duration-300 shadow-xl"
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
