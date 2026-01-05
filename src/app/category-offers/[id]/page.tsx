'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Tag, Calendar, ChevronRight, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

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
    isActive: boolean;
    categories: {
        id: string;
        category: Category;
    }[];
}

export default function CategoryOfferDetailPage({ params }: { params: { id: string } }) {
    const [offer, setOffer] = useState<CategoryOffer | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOffer();
    }, [params.id]);

    const fetchOffer = async () => {
        try {
            const res = await fetch(`/api/category-offers/${params.id}`);
            if (res.ok) {
                const data = await res.json();
                setOffer(data.offer);
            }
        } catch (error) {
            console.error('Error fetching offer:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="spinner" />
            </div>
        );
    }

    if (!offer) {
        return (
            <div className="container mx-auto px-4 py-8">
                <p className="text-center text-gray-500">العرض غير موجود</p>
            </div>
        );
    }

    const daysLeft = Math.ceil((new Date(offer.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                    <Link href="/" className="hover:text-primary">الرئيسية</Link>
                    <ChevronRight className="w-4 h-4" />
                    <Link href="/category-offers" className="hover:text-primary">عروض المتاجر</Link>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-secondary-900">{offer.title}</span>
                </div>

                {/* Offer Header */}
                <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-8">
                    <div className="grid md:grid-cols-2 gap-0">
                        {/* Image */}
                        <div className="relative h-80 md:h-auto bg-gray-100">
                            {offer.image ? (
                                <Image
                                    src={offer.image}
                                    alt={offer.title}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Tag className="w-24 h-24 text-gray-300" />
                                </div>
                            )}

                            {/* Discount Badge */}
                            <div className="absolute top-4 right-4">
                                <div className="bg-white shadow-lg px-6 py-3 rounded-xl border-2 border-primary">
                                    <div className="flex items-center gap-2">
                                        <span className="font-black text-2xl text-primary">
                                            {offer.discountType === 'percentage' ? `${offer.discountValue}%` : `${offer.discountValue} ل.س`}
                                        </span>
                                    </div>
                                    <div className="text-xs font-medium text-gray-600 text-center">خصم</div>
                                </div>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="p-8">
                            <h1 className="text-3xl font-black text-secondary-900 mb-4">{offer.title}</h1>

                            {offer.description && (
                                <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                                    {offer.description}
                                </p>
                            )}

                            {/* Info Cards */}
                            <div className="space-y-4 mb-6">
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                                    <div>
                                        <div className="text-sm text-gray-500 font-medium">باقي على انتهاء العرض</div>
                                        <div className="text-lg font-bold text-secondary-900">
                                            {daysLeft > 0 ? `${daysLeft} ${daysLeft === 1 ? 'يوم' : 'أيام'}` : 'ينتهي قريباً'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                                    <div>
                                        <div className="text-sm text-gray-500 font-medium">فترة العرض</div>
                                        <div className="text-base font-bold text-secondary-900">
                                            {new Date(offer.startDate).toLocaleDateString('ar-SY')} - {new Date(offer.endDate).toLocaleDateString('ar-SY')}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <Package className="w-5 h-5 text-primary flex-shrink-0" />
                                    <div>
                                        <div className="text-sm text-gray-500 font-medium">المتاجر المشمولة</div>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {offer.categories.map(({ category }) => (
                                                <Link
                                                    key={category.id}
                                                    href={`/categories/${category.id}`}
                                                    className="bg-white px-3 py-1 rounded-full text-sm font-semibold text-secondary-900 hover:bg-primary hover:text-secondary transition-colors border border-gray-300"
                                                >
                                                    {category.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Categories Section */}
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <Package className="w-6 h-6 text-primary" />
                        <h2 className="text-2xl font-bold text-secondary-900">المتاجر المشمولة بالعرض</h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {offer.categories.map(({ category }) => (
                            <Link
                                key={category.id}
                                href={`/categories/${category.id}`}
                                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                            >
                                <div className="relative h-48 bg-gray-100">
                                    {category.image ? (
                                        <Image
                                            src={category.image}
                                            alt={category.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Package className="w-12 h-12 text-gray-300" />
                                        </div>
                                    )}

                                    {/* Offer Badge */}
                                    <div className="absolute top-3 right-3 bg-primary px-2 py-1 rounded-full text-xs font-bold text-secondary-900">
                                        خصم {offer.discountType === 'percentage' ? `${offer.discountValue}%` : `${offer.discountValue} ل.س`}
                                    </div>
                                </div>

                                <div className="p-4">
                                    <h3 className="font-bold text-secondary-900 text-center">
                                        {category.name}
                                    </h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
