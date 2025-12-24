'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Tag } from 'lucide-react';
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
}

export default function OffersPage() {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch active offers
        // Note: You'll need to ensure an API endpoint exists for this, or reuse products API with filters
        // For now, let's assume we have an endpoint or display empty state
        setLoading(false);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="flex items-center gap-3 mb-8">
                    <Tag className="w-8 h-8 text-primary" />
                    <h1 className="text-3xl font-bold text-secondary-800">العروض والخصومات</h1>
                </div>

                {loading ? (
                    <div className="spinner mx-auto"></div>
                ) : offers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Offer Cards would go here */}
                    </div>
                ) : (
                    <div className="card p-12 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Tag className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-secondary-800 mb-2">لا توجد عروض حالياً</h3>
                        <p className="text-gray-500 mb-6">ترقبوا أقوى العروض والخصومات قريباً!</p>
                        <Link href="/products" className="btn btn-primary">
                            تصفح المنتجات
                        </Link>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
