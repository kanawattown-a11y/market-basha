'use client';

import { useState, useEffect } from 'react';
import { X, Search, Truck, Check } from 'lucide-react';
import Image from 'next/image';

interface Driver {
    id: string;
    name: string;
    phone: string;
    vehicleType: string | null;
    avatar: string | null;
    isAvailable: boolean;
    _count?: {
        driverOrders: number;
    };
}

interface DriverAssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAssign: (driverId: string) => Promise<void>;
    currentDriverId?: string | null;
    orderId: string;
}

export default function DriverAssignmentModal({
    isOpen,
    onClose,
    onAssign,
    currentDriverId,
    orderId
}: DriverAssignmentModalProps) {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedDriverId, setSelectedDriverId] = useState<string | null>(currentDriverId || null);
    const [assigning, setAssigning] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchDrivers();
        }
    }, [isOpen]);

    const fetchDrivers = async () => {
        setLoading(true);
        try {
            // Fetch only active drivers
            // We fetch all drivers (available or not) to show them, but prioritize available ones visually if needed
            // Ideally we want available ones. Let's fetch available ones.
            // But if we want to reassign to a busy driver? Maybe just fetch all ACTIVE drivers.
            // Requirement said "available drivers", lets try filtering by available but maybe the business logic allows assigning busy ones too?
            // "from available drivers" was the prompt. So let's stick to isAvailable=true initially, or just show availability status.
            // Let's fetch ALL active drivers and show their status.

            const params = new URLSearchParams({
                role: 'DRIVER',
                status: 'ACTIVE',
                limit: '50'
            });

            if (search) {
                params.append('search', search);
            }

            const res = await fetch(`/api/users?${params}`);
            if (res.ok) {
                const data = await res.json();
                setDrivers(data.users);
            }
        } catch (error) {
            console.error('Error fetching drivers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedDriverId) return;

        setAssigning(true);
        try {
            await onAssign(selectedDriverId);
            onClose();
        } catch (error) {
            console.error('Error assigning driver:', error);
        } finally {
            setAssigning(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-lg text-secondary-800">تعيين سائق للطلب</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="بحث عن سائق..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchDrivers()}
                            className="input pr-10 bg-white"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                </div>

                <div className="overflow-y-auto flex-1 p-4 space-y-2">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="spinner"></div>
                        </div>
                    ) : drivers.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            لا يوجد سائقين مطابقين
                        </div>
                    ) : (
                        drivers.map(driver => (
                            <button
                                key={driver.id}
                                onClick={() => setSelectedDriverId(driver.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${selectedDriverId === driver.id
                                        ? 'border-primary bg-primary/5 shadow-sm'
                                        : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                                    {driver.avatar ? (
                                        <Image src={driver.avatar} alt={driver.name} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <Truck className="w-6 h-6" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 text-right">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-secondary-900">{driver.name}</span>
                                        {driver.isAvailable ? (
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">متاح</span>
                                        ) : (
                                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">مشغول</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                        <span>{driver.phone}</span>
                                        <span>•</span>
                                        <span>{driver.vehicleType || 'مركبة غير محددة'}</span>
                                    </div>
                                </div>

                                {selectedDriverId === driver.id && (
                                    <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center shadow-sm">
                                        <Check className="w-4 h-4" />
                                    </div>
                                )}
                            </button>
                        ))
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="btn btn-outline"
                        disabled={assigning}
                    >
                        إلغاء
                    </button>
                    <button
                        onClick={handleAssign}
                        disabled={!selectedDriverId || assigning || selectedDriverId === currentDriverId}
                        className="btn btn-primary min-w-[120px]"
                    >
                        {assigning ? <div className="spinner w-5 h-5 border-white border-t-transparent" /> : 'تعيين السائق'}
                    </button>
                </div>
            </div>
        </div>
    );
}
