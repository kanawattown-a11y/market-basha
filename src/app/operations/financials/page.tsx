'use client';

import { useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Package,
    Truck,
    Calendar,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface FinancialData {
    period: string;
    summary: {
        totalOrders: number;
        totalProductsSold: number;
        productRevenue: number;
        productCost: number;
        productProfit: number;
        productMargin: number;
        deliveryRevenue: number;
        driverCost: number;
        deliveryProfit: number;
        deliveryMargin: number;
        grossProfit: number;
        overallMargin: number;
        totalRevenue: number;
    };
    topProducts: Array<{
        name: string;
        quantity: number;
        revenue: number;
        cost: number;
        profit: number;
    }>;
}

export default function FinancialsPage() {
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
                    <p className="text-gray-500">تحليل شامل للأرباح والتكاليف</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                        <span className="text-sm text-gray-500">إجمالي الأرباح</span>
                        <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-2xl font-bold text-primary">
                        {formatCurrency(summary.grossProfit)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        هامش ربح {summary.overallMargin.toFixed(1)}%
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
                        <span className="text-sm text-gray-500">ربح التوصيل</span>
                        <Truck className="w-5 h-5 text-orange-600" />
                    </div>
                    <p className="text-2xl font-bold text-secondary-800">
                        {formatCurrency(summary.deliveryProfit)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        هامش {summary.deliveryMargin.toFixed(1)}%
                    </p>
                </div>
            </div>

            {/* Product Financials */}
            <div className="card p-6">
                <h2 className="text-lg font-bold text-secondary-800 mb-4">تحليل المنتجات</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">ربح المنتجات</p>
                        <p className="text-xl font-bold text-primary">
                            {formatCurrency(summary.productProfit)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            هامش {summary.productMargin.toFixed(1)}%
                        </p>
                    </div>
                </div>
            </div>

            {/* Delivery Financials */}
            <div className="card p-6">
                <h2 className="text-lg font-bold text-secondary-800 mb-4">تحليل التوصيل</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">صافي ربح التوصيل</p>
                        <p className="text-xl font-bold text-primary">
                            {formatCurrency(summary.deliveryProfit)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            هامش {summary.deliveryMargin.toFixed(1)}%
                        </p>
                    </div>
                </div>
            </div>

            {/* Top Products */}
            {data.topProducts.length > 0 && (
                <div className="card">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-secondary-800">
                            المنتجات الأكثر ربحية
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>المنتج</th>
                                    <th>الكمية</th>
                                    <th>الإيرادات</th>
                                    <th>التكلفة</th>
                                    <th>الربح</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.topProducts.map((product, index) => (
                                    <tr key={index}>
                                        <td className="font-medium">{product.name}</td>
                                        <td>{product.quantity}</td>
                                        <td className="text-green-700">
                                            {formatCurrency(product.revenue)}
                                        </td>
                                        <td className="text-red-700">
                                            {formatCurrency(product.cost)}
                                        </td>
                                        <td className="font-bold text-primary">
                                            {formatCurrency(product.profit)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
