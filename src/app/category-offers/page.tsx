'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Tag, Calendar, ChevronRight, Package, Store } from 'lucide-react';

interface Category {
    id: string;
    name: string;
    image: string | null;
}

interface CategoryOffer {
    id: string;
    title: string;
    description: string | null;
    image: string | null;
    discountType: string;
    discountValue: number;
    startDate: string;
    endDate: string;
    categories: {
        id: string;
        category: Category;
    }[];
}

export default function CategoryOffersPage() {
    const [offers, setOffers] = useState<CategoryOffer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOffers();
    }, []);

    const fetchOffers = async () => {
        try {
            const res = await fetch('/api/category-offers?active=true');
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

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <Link href="/" className="hover:text-primary">الرئيسية</Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-secondary-900">عروض المتاجر</span>
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                        <Store className="w-8 h-8 text-primary" />
                        <h1 className="text-3xl font-black text-secondary-900">عروض المتاجر</h1>
                    </div>
                    <p className="text-gray-600">اكتشف أفضل العروض على متاجرنا المختارة</p>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="spinner" />
                    </div>
                )}

                {/* No Offers */}
                {!loading && offers.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-2xl shadow-md">
                        <Tag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">لا توجد عروض نشطة حالياً</p>
                        <Link href="/" className="btn btn-primary mt-4">
                            العودة للرئيسية
                        </Link>
                    </div>
                )}

                {/* Offers Grid */}
                {!loading && offers.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {offers.map((offer) => {
                            const daysLeft = getDaysLeft(offer.endDate);

                            return (
                                <Link
                                    key={offer.id}
                                    href={`/category-offers/${offer.id}`}
                                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                                >
                                    {/* Image */}
                                    <div className="relative h-56 bg-gradient-to-br from-primary/10 to-primary/5">
                                        {offer.image ? (
                                            <Image
                                                src={offer.image}
                                                alt={offer.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Tag className="w-20 h-20 text-primary/20" />
                                            </div>
                                        )}

                                        {/* Discount Badge */}
                                        <div className="absolute top-4 right-4">
                                            <div className="bg-red-500 text-white px-4 py-2 rounded-xl font-black text-xl shadow-lg">
                                                خصم {offer.discountType === 'percentage' ? `${offer.discountValue}%` : `${offer.discountValue} ل.س`}
                                            </div>
                                        </div>

                                        {/* Days Left Badge */}
                                        {daysLeft > 0 && (
                                            <div className="absolute bottom-4 left-4">
                                                <div className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-lg flex items-center gap-2 shadow-md">
                                                    <Calendar className="w-4 h-4 text-primary" />
                                                    <span className="text-sm font-bold text-secondary-900">
                                                        باقي {daysLeft} {daysLeft === 1 ? 'يوم' : 'أيام'}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        <h3 className="text-xl font-black text-secondary-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                            {offer.title}
                                        </h3>

                                        {offer.description && (
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                                {offer.description}
                                            </p>
                                        )}

                                        {/* Categories */}
                                        <div className="mb-4">
                                            <div className="text-xs text-gray-500 mb-2">المتاجر المشمولة:</div>
                                            <div className="flex flex-wrap gap-2">
                                                {offer.categories.slice(0, 3).map((cat) => (
                                                    <span
                                                        key={cat.id}
                                                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold"
                                                    >
                                                        {cat.category.name}
                                                    </span>
                                                ))}
                                                {offer.categories.length > 3 && (
                                                    <span className="text-xs text-gray-500 self-center">
                                                        +{offer.categories.length - 3} أخرى
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Date Range */}
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Calendar className="w-4 h-4" />
                                            <span>
                                                {new Date(offer.startDate).toLocaleDateString('ar-SY')} - {new Date(offer.endDate).toLocaleDateString('ar-SY')}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
