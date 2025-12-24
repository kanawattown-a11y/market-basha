'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Plus, Edit, Trash2, Star, Check } from 'lucide-react';

interface Address {
    id: string;
    title: string;
    fullAddress: string;
    area: string;
    building: string | null;
    floor: string | null;
    notes: string | null;
    isDefault: boolean;
}

export default function AddressesPage() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAddresses = async () => {
        try {
            const res = await fetch('/api/addresses');
            if (res.ok) {
                const data = await res.json();
                setAddresses(data.addresses);
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const setDefault = async (addressId: string) => {
        try {
            await fetch(`/api/addresses/${addressId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isDefault: true }),
            });
            fetchAddresses();
        } catch (error) {
            console.error('Error setting default address:', error);
        }
    };

    const deleteAddress = async (addressId: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا العنوان؟')) return;

        try {
            await fetch(`/api/addresses/${addressId}`, { method: 'DELETE' });
            fetchAddresses();
        } catch (error) {
            console.error('Error deleting address:', error);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="spinner mx-auto"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-secondary-800">عناويني</h1>
                <Link href="/account/addresses/new" className="btn btn-primary btn-sm">
                    <Plus className="w-4 h-4" />
                    إضافة عنوان
                </Link>
            </div>

            {addresses.length === 0 ? (
                <div className="card p-12 text-center">
                    <MapPin className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 mb-4">لا توجد عناوين محفوظة</p>
                    <Link href="/account/addresses/new" className="btn btn-primary">
                        إضافة عنوان جديد
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                        <div key={address.id} className="card p-4 relative">
                            {address.isDefault && (
                                <span className="absolute top-3 left-3 bg-primary text-secondary text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                    <Star className="w-3 h-3" />
                                    افتراضي
                                </span>
                            )}

                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                                    <MapPin className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-secondary-800">{address.title}</h3>
                                    <p className="text-gray-600 text-sm mt-1">{address.fullAddress}</p>
                                    <p className="text-gray-400 text-sm">{address.area}</p>
                                    {address.notes && (
                                        <p className="text-gray-400 text-xs mt-1">ملاحظات: {address.notes}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                                {!address.isDefault && (
                                    <button
                                        onClick={() => setDefault(address.id)}
                                        className="btn btn-sm btn-outline flex-1"
                                    >
                                        <Check className="w-4 h-4" />
                                        تعيين كافتراضي
                                    </button>
                                )}
                                <Link
                                    href={`/account/addresses/${address.id}/edit`}
                                    className="btn btn-sm btn-ghost"
                                >
                                    <Edit className="w-4 h-4" />
                                </Link>
                                <button
                                    onClick={() => deleteAddress(address.id)}
                                    className="btn btn-sm btn-ghost text-red-500"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
