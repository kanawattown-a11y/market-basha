'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Plus,
    Gift,
    Edit,
    Trash2,
    Calendar,
    Percent
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Offer {
    id: string;
    title: string;
    description: string | null;
    discountType: string;
    discountValue: number;
    minOrderAmount: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    usageCount: number;
}

export default function AdminOffersPage() {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOffers = async () => {
        try {
            const res = await fetch('/api/offers?all=true');
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

    useEffect(() => {
        fetchOffers();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من الحذف؟')) return;

        try {
            await fetch(`/api/offers/${id}`, { method: 'DELETE' });
            fetchOffers();
        } catch (error) {
            console.error('Error deleting offer:', error);
        }
    };

    const isExpired = (endDate: string) => new Date(endDate) < new Date();
    const isUpcoming = (startDate: string) => new Date(startDate) > new Date();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-800">إدارة العروض</h1>
                    <p className="text-gray-500">إنشاء وإدارة العروض والخصومات</p>
                </div>
                <Link href="/operations/offers/new" className="btn btn-primary">
                    <Plus className="w-5 h-5" />
                    إضافة عرض
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="spinner mx-auto"></div>
                </div>
            ) : offers.length === 0 ? (
                <div className="card p-12 text-center">
                    <Gift className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 mb-4">لا توجد عروض</p>
                    <Link href="/operations/offers/new" className="btn btn-primary">
                        إضافة عرض جديد
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {offers.map((offer) => (
                        <div key={offer.id} className="card overflow-hidden">
                            <div className="p-4 bg-gradient-to-l from-primary to-yellow-400 text-secondary">
                                <div className="flex items-center justify-between">
                                    <Gift className="w-8 h-8" />
                                    <span className="text-2xl font-bold">
                                        {offer.discountType === 'PERCENTAGE'
                                            ? `${offer.discountValue}%`
                                            : formatCurrency(Number(offer.discountValue))
                                        }
                                    </span>
                                </div>
                            </div>

                            <div className="p-4">
                                <h3 className="font-bold text-secondary-800">{offer.title}</h3>
                                {offer.description && (
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{offer.description}</p>
                                )}

                                <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                                    <Calendar className="w-4 h-4" />
                                    <span>{formatDate(offer.startDate)} - {formatDate(offer.endDate)}</span>
                                </div>

                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                    <div>
                                        {isExpired(offer.endDate) ? (
                                            <span className="badge bg-gray-100 text-gray-500">منتهي</span>
                                        ) : isUpcoming(offer.startDate) ? (
                                            <span className="badge bg-blue-100 text-blue-700">قادم</span>
                                        ) : offer.isActive ? (
                                            <span className="badge bg-green-100 text-green-700">نشط</span>
                                        ) : (
                                            <span className="badge bg-gray-100 text-gray-500">غير نشط</span>
                                        )}
                                        <span className="text-xs text-gray-400 mr-2">{offer.usageCount} استخدام</span>
                                    </div>
                                    <div className="flex gap-1">
                                        <Link href={`/operations/offers/${offer.id}/edit`} className="btn btn-ghost btn-sm">
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                        <button onClick={() => handleDelete(offer.id)} className="btn btn-ghost btn-sm text-red-500">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
