'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Tag, Clock, Percent, TrendingDown, ArrowLeft } from 'lucide-react';
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
            <main className="container mx-auto px-4 py-8">
                {/* Clean Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <Tag className="w-6 h-6 text-primary" />
                        </div>
                        <h1 className="text-3xl font-black text-secondary-900">العروض والخصومات</h1>
                    </div>
                    <p className="text-gray-600 text-lg">
                        استمتع بأفضل العروض والخصومات الحصرية
                    </p>
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
                                    className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                                >
                                    {/* Image Section with Clean Overlay */}
                                    <div className="relative h-56 bg-gray-100 overflow-hidden">
                                        {offer.image ? (
                                            <Image
                                                src={offer.image}
                                                alt={offer.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                                                <Tag className="w-16 h-16 text-gray-300" />
                                            </div>
                                        )}

                                        {/* Clean Discount Badge */}
                                        <div className="absolute top-4 right-4">
                                            <div className="bg-white shadow-lg backdrop-blur-sm px-4 py-2 rounded-xl border-2 border-primary">
                                                <div className="flex items-center gap-1.5">
                                                    {isPercentage && <Percent className="w-4 h-4 text-primary" />}
                                                    <span className="font-black text-xl text-primary">
                                                        {formatDiscount(offer.discountType, offer.discountValue)}
                                                    </span>
                                                </div>
                                                <div className="text-xs font-medium text-gray-600 text-center">خصم</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-secondary-900 mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                                            {offer.title}
                                        </h3>

                                        {offer.description && (
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                                                {offer.description}
                                            </p>
                                        )}

                                        {/* Time Left - Clean Design */}
                                        <div className="flex items-center gap-2 mb-5 p-3 bg-gray-50 rounded-xl border border-gray-200">
                                            <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                            <div className="flex-1">
                                                <div className="text-xs text-gray-500 font-medium">باقي على الانتهاء</div>
                                                <div className="text-base font-bold text-secondary-900">
                                                    {daysLeft > 0 ? `${daysLeft} ${daysLeft === 1 ? 'يوم' : 'أيام'}` : 'ينتهي قريباً'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* CTA Button */}
                                        <Link
                                            href={`/offers/${offer.id}`}
                                            className="btn btn-primary w-full group/btn flex items-center justify-center gap-2"
                                        >
                                            <span>استفد من العرض</span>
                                            <ArrowLeft className="w-4 h-4 group-hover/btn:-translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="card p-12 text-center max-w-2xl mx-auto">
                        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Tag className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-secondary-800 mb-3">لا توجد عروض حالياً</h3>
                        <p className="text-gray-600 mb-8 text-lg">
                            ترقبوا أقوى العروض والخصومات الحصرية قريباً!
                        </p>
                        <Link href="/products" className="btn btn-primary btn-lg inline-flex items-center gap-2">
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
