'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Gift, Calendar } from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';

interface Offer {
    id: string;
    title: string;
    description: string | null;
    discountType: string;
    discountValue: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
}

export default function OperationsOffersPage() {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const res = await fetch('/api/offers');
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
        fetchOffers();
    }, []);

    const toggleActive = async (id: string, isActive: boolean) => {
        try {
            await fetch(`/api/offers/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !isActive }),
            });
            setOffers(offers.map(o => o.id === id ? { ...o, isActive: !isActive } : o));
        } catch (error) {
            console.error('Error updating offer:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا العرض؟')) return;
        try {
            await fetch(`/api/offers/${id}`, { method: 'DELETE' });
            setOffers(offers.filter(o => o.id !== id));
        } catch (error) {
            console.error('Error deleting offer:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-800">العروض</h1>
                    <p className="text-gray-500">إدارة العروض والخصومات</p>
                </div>
                <Link href="/operations/offers/new" className="btn btn-primary">
                    <Plus className="w-5 h-5" />
                    إضافة عرض
                </Link>
            </div>

            <div className="card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>العرض</th>
                                <th>الخصم</th>
                                <th>الفترة</th>
                                <th>الحالة</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-8">
                                        <div className="spinner mx-auto"></div>
                                    </td>
                                </tr>
                            ) : offers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-gray-500">
                                        لا توجد عروض
                                    </td>
                                </tr>
                            ) : (
                                offers.map((offer) => (
                                    <tr key={offer.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                                    <Gift className="w-5 h-5 text-orange-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-secondary-800">{offer.title}</p>
                                                    {offer.description && (
                                                        <p className="text-xs text-gray-400">{offer.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="font-bold text-primary">
                                                {offer.discountType === 'PERCENTAGE'
                                                    ? `${offer.discountValue}%`
                                                    : formatCurrency(Number(offer.discountValue))}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="text-sm">
                                                <div className="flex items-center gap-1 text-gray-500">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(offer.startDate).toLocaleDateString('ar')}
                                                </div>
                                                <div className="text-gray-400">
                                                    إلى {new Date(offer.endDate).toLocaleDateString('ar')}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => toggleActive(offer.id, offer.isActive)}
                                                className={`badge cursor-pointer ${offer.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                                            >
                                                {offer.isActive ? 'نشط' : 'معطل'}
                                            </button>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-1">
                                                <Link href={`/operations/offers/${offer.id}/edit`} className="btn btn-ghost btn-sm">
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button onClick={() => handleDelete(offer.id)} className="btn btn-ghost btn-sm text-red-500">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
