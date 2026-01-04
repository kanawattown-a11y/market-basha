'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Package,
    ClipboardList,
    Truck,
    AlertTriangle,
    CheckCircle,
    Clock,
    Activity,
    RefreshCw,
    Ticket,
    DollarSign,
    TrendingUp,
    MapPin,
    ShoppingBag
} from 'lucide-react';
import { formatCurrency, formatRelativeTime, translateOrderStatus, getOrderStatusColor } from '@/lib/utils';

interface TopProduct {
    id: string;
    name: string;
    image: string | null;
    price: number;
    quantitySold: number;
    totalRevenue: number;
}

interface AreaStat {
    id: string;
    name: string;
    users: number;
    orders: number;
    revenue: number;
}

interface Stats {
    general: {
        pendingOrders: number;
        todayOrders: number;
        weekOrders: number;
        lowStockProducts: number;
        openTickets: number;
        todayRevenue: number;
        weeklyRevenue: number;
        monthlyRevenue: number;
    };
    drivers: {
        total: number;
        available: number;
        busy: number;
    };
    areaStats: AreaStat[];
    topSellingProducts: TopProduct[];
}

interface Order {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    createdAt: string;
    customer: { name: string };
    address: { area: string };
}

export default function OperationsDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [statsRes, ordersRes] = await Promise.all([
                fetch('/api/stats'),
                fetch('/api/orders?status=PENDING,CONFIRMED,PREPARING,READY&limit=10'),
            ]);

            if (statsRes.ok) {
                const data = await statsRes.json();
                setStats(data);
            }

            if (ordersRes.ok) {
                const data = await ordersRes.json();
                setRecentOrders(data.orders || []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading || !stats) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="spinner"></div>
            </div>
        );
    }

    const orderStats = [
        { label: 'طلبات معلقة', value: stats.general.pendingOrders, icon: ClipboardList, color: 'bg-yellow-100 text-yellow-700', link: '/operations/orders?status=PENDING' },
        { label: 'طلبات اليوم', value: stats.general.todayOrders, icon: Package, color: 'bg-blue-100 text-blue-700', link: '/operations/orders' },
        { label: 'نفاذ مخزون', value: stats.general.lowStockProducts, icon: AlertTriangle, color: 'bg-red-100 text-red-700', link: '/operations/products' },
        { label: 'تذاكر مفتوحة', value: stats.general.openTickets, icon: Ticket, color: 'bg-purple-100 text-purple-700', link: '/operations/tickets' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-800">لوحة العمليات</h1>
                    <p className="text-gray-500">نظرة عامة على العمليات والإيرادات</p>
                </div>
                <button onClick={fetchData} className="btn btn-outline btn-sm" disabled={loading}>
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Revenue Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">إيرادات اليوم</p>
                            <p className="text-2xl font-bold text-green-700">{formatCurrency(stats.general.todayRevenue)}</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">إيرادات الأسبوع</p>
                            <p className="text-2xl font-bold text-blue-700">{formatCurrency(stats.general.weeklyRevenue)}</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center text-white">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">إيرادات الشهر</p>
                            <p className="text-2xl font-bold text-purple-700">{formatCurrency(stats.general.monthlyRevenue)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {orderStats.map((stat, i) => (
                    <Link key={i} href={stat.link} className="card p-4 hover:shadow-lg transition-shadow">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color} mb-3`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <p className="text-2xl font-bold text-secondary-800">{stat.value}</p>
                        <p className="text-sm text-gray-500">{stat.label}</p>
                    </Link>
                ))}
            </div>

            {/* Driver Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Link href="/operations/drivers" className="card p-4 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                            <Truck className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">إجمالي السائقين</p>
                            <p className="text-xl font-bold text-secondary-800">{stats.drivers.total}</p>
                        </div>
                    </div>
                </Link>
                <div className="card p-4 bg-gradient-to-br from-green-50 to-green-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">متاحين</p>
                            <p className="text-xl font-bold text-green-600">{stats.drivers.available}</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4 bg-gradient-to-br from-orange-50 to-orange-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">مشغولين</p>
                            <p className="text-xl font-bold text-orange-600">{stats.drivers.busy}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Selling Products */}
                <div className="card">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5 text-primary" />
                            <h3 className="font-bold text-secondary-800">أكثر المنتجات مبيعاً</h3>
                        </div>
                    </div>
                    <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                        {stats.topSellingProducts?.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                لا توجد بيانات
                            </div>
                        ) : (
                            stats.topSellingProducts?.map((product, index) => (
                                <div key={product.id} className="p-3 flex items-center gap-3">
                                    <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold">
                                        {index + 1}
                                    </span>
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                        {product.image ? (
                                            <Image src={product.image} alt={product.name} width={40} height={40} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="w-5 h-5 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-secondary-800 truncate">{product.name}</p>
                                        <p className="text-xs text-gray-500">{product.quantitySold} قطعة مباعة</p>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-primary">{formatCurrency(product.totalRevenue)}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Area Stats */}
                <div className="card">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-primary" />
                            <h3 className="font-bold text-secondary-800">إحصائيات المناطق</h3>
                        </div>
                    </div>
                    <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                        {stats.areaStats?.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                لا توجد مناطق
                            </div>
                        ) : (
                            stats.areaStats?.map((area) => (
                                <div key={area.id} className="p-3 flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-secondary-800">{area.name}</p>
                                        <p className="text-xs text-gray-500">{area.users} عميل • {area.orders} طلب</p>
                                    </div>
                                    <p className="font-bold text-primary">{formatCurrency(area.revenue)}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="card">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-secondary-800">الطلبات النشطة</h3>
                    <Link href="/operations/orders" className="text-primary text-sm hover:underline">
                        عرض الكل
                    </Link>
                </div>
                <div className="divide-y divide-gray-100">
                    {recentOrders.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            لا توجد طلبات نشطة
                        </div>
                    ) : (
                        recentOrders.map((order) => (
                            <Link
                                key={order.id}
                                href={`/operations/orders/${order.id}`}
                                className="block p-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-secondary-800">#{order.orderNumber}</span>
                                        <span className={`badge ${getOrderStatusColor(order.status)}`}>
                                            {translateOrderStatus(order.status)}
                                        </span>
                                    </div>
                                    <span className="text-primary font-bold">{formatCurrency(Number(order.total))}</span>
                                </div>
                                <div className="flex items-center justify-between mt-1 text-sm">
                                    <span className="text-gray-600">{order.customer?.name} • {order.address?.area}</span>
                                    <span className="text-gray-400">{formatRelativeTime(order.createdAt)}</span>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
