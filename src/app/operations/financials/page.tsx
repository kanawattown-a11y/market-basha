'use client';

import { useState, useEffect } from 'react';
import {
    DollarSign,
    Package,
    Truck,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface FinancialData {
    period: string;
    summary: {
        totalOrders: number;
        totalProductsSold: number;
        productRevenue: number;
        productCost: number;
        deliveryRevenue: number;
        driverCost: number;
        totalRevenue: number;
    };
}

export default function OperationsFinancialsPage() {
    const [data, setData] = useState<FinancialData | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('month');

    const fetchFinancials = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/financials?period=${period}`);
            if (res.ok) {
                const financials = await res.json();
                setData(financials);
            }
        } catch (error) {
            console.error('Error fetching financials:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFinancials();
    }, [period]);

    if (loading || !data) {
        return (
            <div className="text-center py-12">
                <div className="spinner mx-auto"></div>
            </div>
        );
    }

    const { summary } = data;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-800">التقارير المالية</h1>
                    <p className="text-gray-500">تحليل الإيرادات والتكاليف</p>
                </div>

                <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="input w-auto"
                >
                    <option value="day">اليوم</option>
                    <option value="week">هذا الأسبوع</option>
                    <option value="month">هذا الشهر</option>
                    <option value="year">هذه السنة</option>
                </select>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">إجمالي الإيرادات</span>
                        <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-secondary-800">
                        {formatCurrency(summary.totalRevenue)}
                    </p>
                </div>

                <div className="card p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">عدد الطلبات</span>
                        <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-secondary-800">
                        {summary.totalOrders}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        {summary.totalProductsSold} منتج
                    </p>
                </div>

                <div className="card p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">رسوم التوصيل</span>
                        <Truck className="w-5 h-5 text-orange-600" />
                    </div>
                    <p className="text-2xl font-bold text-secondary-800">
                        {formatCurrency(summary.deliveryRevenue)}
                    </p>
                </div>
            </div>

            {/* Product Financials */}
            <div className="card p-6">
                <h2 className="text-lg font-bold text-secondary-800 mb-4">تحليل المنتجات</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">إيرادات المنتجات</p>
                        <p className="text-xl font-bold text-green-700">
                            {formatCurrency(summary.productRevenue)}
                        </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">تكلفة المنتجات</p>
                        <p className="text-xl font-bold text-red-700">
                            {formatCurrency(summary.productCost)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Delivery Financials */}
            <div className="card p-6">
                <h2 className="text-lg font-bold text-secondary-800 mb-4">تحليل التوصيل</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">رسوم التوصيل (من العملاء)</p>
                        <p className="text-xl font-bold text-green-700">
                            {formatCurrency(summary.deliveryRevenue)}
                        </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">تكلفة السائقين</p>
                        <p className="text-xl font-bold text-red-700">
                            {formatCurrency(summary.driverCost)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
