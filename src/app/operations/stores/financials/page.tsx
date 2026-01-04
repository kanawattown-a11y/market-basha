'use client';

import { useState, useEffect } from 'react';
import { Store, TrendingUp, Package, ShoppingCart, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';

interface StoreFinancials {
    categoryId: string;
    categoryName: string;
    categoryImage: string | null;
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    productsSold: number;
    ordersCount: number;
    profitMargin: number;
}

interface FinancialsData {
    period: string;
    stores: StoreFinancials[];
    totals: {
        totalRevenue: number;
        totalCost: number;
        totalProfit: number;
        productsSold: number;
        ordersCount: number;
        profitMargin: number;
    };
}

export default function OperationsStoreFinancialsPage() {
    const [data, setData] = useState<FinancialsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('month');

    const fetchFinancials = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/stores/financials?period=${period}`);
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

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-800">التقارير المالية للمتاجر</h1>
                    <p className="text-gray-500">تحليل أرباح كل متجر على حدة</p>
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
                        <span className="text-sm text-gray-500">إجمالي المبيعات</span>
                        <ShoppingCart className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-secondary-800">
                        {formatCurrency(data.totals.totalRevenue)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        {data.totals.ordersCount} طلب | {data.totals.productsSold} منتج
                    </p>
                </div>

                <div className="card p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">رأس المال (للمتاجر)</span>
                        <Store className="w-5 h-5 text-orange-600" />
                    </div>
                    <p className="text-2xl font-bold text-orange-700">
                        {formatCurrency(data.totals.totalCost)}
                    </p>
                </div>

                <div className="card p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">صافي الربح</span>
                        <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-2xl font-bold text-primary">
                        {formatCurrency(data.totals.totalProfit)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        هامش {data.totals.profitMargin.toFixed(1)}%
                    </p>
                </div>

                <div className="card p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">عدد المتاجر</span>
                        <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-secondary-800">
                        {data.stores.length}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">متجر نشط</p>
                </div>
            </div>

            {/* Stores Table */}
            <div className="card">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-secondary-800">تفاصيل المتاجر</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>المتجر</th>
                                <th>المبيعات</th>
                                <th>رأس المال</th>
                                <th>الربح</th>
                                <th>هامش الربح</th>
                                <th>المنتجات</th>
                                <th>الطلبات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.stores.map((store) => (
                                <tr key={store.categoryId}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            {store.categoryImage ? (
                                                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
                                                    <Image
                                                        src={store.categoryImage}
                                                        alt={store.categoryName}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <Store className="w-5 h-5 text-primary" />
                                                </div>
                                            )}
                                            <span className="font-medium">{store.categoryName}</span>
                                        </div>
                                    </td>
                                    <td className="font-semibold text-green-700">
                                        {formatCurrency(store.totalRevenue)}
                                    </td>
                                    <td className="text-orange-700">
                                        {formatCurrency(store.totalCost)}
                                    </td>
                                    <td className="font-bold text-primary">
                                        {formatCurrency(store.totalProfit)}
                                    </td>
                                    <td>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${store.profitMargin >= 30
                                                ? 'bg-green-100 text-green-800'
                                                : store.profitMargin >= 20
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {store.profitMargin.toFixed(1)}%
                                        </span>
                                    </td>
                                    <td>{store.productsSold}</td>
                                    <td>{store.ordersCount}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-gray-50 font-bold">
                                <td>الإجمالي</td>
                                <td className="text-green-700">
                                    {formatCurrency(data.totals.totalRevenue)}
                                </td>
                                <td className="text-orange-700">
                                    {formatCurrency(data.totals.totalCost)}
                                </td>
                                <td className="text-primary">
                                    {formatCurrency(data.totals.totalProfit)}
                                </td>
                                <td>{data.totals.profitMargin.toFixed(1)}%</td>
                                <td>{data.totals.productsSold}</td>
                                <td>{data.totals.ordersCount}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Financial Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card p-6">
                    <h3 className="font-bold text-secondary-800 mb-4">توزيع الإيرادات</h3>
                    <div className="space-y-3">
                        {data.stores.slice(0, 5).map((store) => {
                            const percentage = (store.totalRevenue / data.totals.totalRevenue) * 100;
                            return (
                                <div key={store.categoryId}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>{store.categoryName}</span>
                                        <span className="font-medium">{percentage.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-primary rounded-full h-2 transition-all"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="card p-6">
                    <h3 className="font-bold text-secondary-800 mb-4">الأكثر ربحية</h3>
                    <div className="space-y-3">
                        {data.stores.slice(0, 5).map((store, index) => (
                            <div key={store.categoryId} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold">
                                        {index + 1}
                                    </span>
                                    <span className="font-medium">{store.categoryName}</span>
                                </div>
                                <span className="text-primary font-bold">
                                    {formatCurrency(store.totalProfit)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
