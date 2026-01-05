'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Calendar, Clock, Tag, Percent, Package, ShoppingCart } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { formatCurrency } from '@/lib/utils';

interface Product {
    id: string;
    name: string;
    price: number;
    image: string | null;
}

interface Offer {
    id: string;
    title: string;
    titleEn: string | null;
    description: string | null;
    image: string | null;
    discountType: string;
    discountValue: number;
    minOrderAmount: number | null;
    startDate: string;
    endDate: string;
    isActive: boolean;
    products: {
        product: Product;
    }[];
}

export default function OfferDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [offer, setOffer] = useState<Offer | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOffer();
    }, [params.id]);

    const fetchOffer = async () => {
        try {
            const res = await fetch(`/api/offers/${params.id}`);
            if (res.ok) {
                const data = await res.json();
                setOffer(data.offer);
            } else {
                router.push('/offers');
            }
        } catch (error) {
            console.error('Error fetching offer:', error);
            router.push('/offers');
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
            return `خصم ${value}%`;
        }
        return `خصم ${value} ل.س`;
    };

    const calculateDiscountedPrice = (originalPrice: number) => {
        if (!offer) return originalPrice;

        if (offer.discountType.toLowerCase() === 'percentage') {
            return originalPrice - (originalPrice * offer.discountValue / 100);
        }
        return originalPrice - offer.discountValue;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="container mx-auto px-4 py-20">
                    <div className="flex justify-center items-center">
                        <div className="spinner"></div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!offer) {
        return null;
    }

    const daysLeft = getDaysLeft(offer.endDate);
    const isPercentage = offer.discountType.toLowerCase() === 'percentage';

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="container mx-auto px-4 py-8">
                {/* Back Button */}
                <Link
                    href="/offers"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors"
                >
                    <ArrowRight className="w-5 h-5" />
                    <span>العودة للعروض</span>
                </Link>

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
                                        {isPercentage && <Percent className="w-5 h-5 text-primary" />}
                                        <span className="font-black text-2xl text-primary">
                                            {isPercentage ? `${offer.discountValue}%` : `${offer.discountValue} ل.س`}
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
                                    <Clock className="w-5 h-5 text-primary flex-shrink-0" />
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

                                {offer.minOrderAmount && (
                                    <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/20">
                                        <ShoppingCart className="w-5 h-5 text-primary flex-shrink-0" />
                                        <div>
                                            <div className="text-sm text-gray-600 font-medium">الحد الأدنى للطلب</div>
                                            <div className="text-lg font-bold text-primary">
                                                {formatCurrency(Number(offer.minOrderAmount))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products in Offer */}
                {offer.products && offer.products.length > 0 && (
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <Package className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-bold text-secondary-900">المنتجات المشمولة بالعرض</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {offer.products.map(({ product }) => {
                                const discountedPrice = calculateDiscountedPrice(Number(product.price));

                                return (
                                    <Link
                                        key={product.id}
                                        href={`/products/${product.id}`}
                                        className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                                    >
                                        <div className="relative h-48 bg-gray-100">
                                            {product.image ? (
                                                <Image
                                                    src={product.image}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Package className="w-12 h-12 text-gray-300" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4">
                                            <h3 className="font-bold text-secondary-900 mb-2 line-clamp-2">
                                                {product.name}
                                            </h3>

                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-black text-primary">
                                                    {formatCurrency(discountedPrice)}
                                                </span>
                                                <span className="text-sm text-gray-400 line-through">
                                                    {formatCurrency(Number(product.price))}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
