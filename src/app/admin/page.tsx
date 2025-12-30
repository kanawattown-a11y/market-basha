'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Users,
    Package,
    ShoppingCart,
    DollarSign,
    TrendingUp,
    UserCheck,
    Truck,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    MapPin,
    RefreshCw,
    Ticket,
    Activity,
    ShoppingBag
} from 'lucide-react';
import { formatCurrency, formatNumber, translateOrderStatus, getOrderStatusColor } from '@/lib/utils';

interface TopProduct {
    id: string;
    name: string;
    image: string | null;
    price: number;
    quantitySold: number;
    totalRevenue: number;
}

interface Stats {
    general: {
        totalUsers: number;
        pendingUsers: number;
        totalProducts: number;
        lowStockProducts: number;
        totalOrders: number;
        todayOrders: number;
        weekOrders: number;
        pendingOrders: number;
        monthlyRevenue: number;
        weeklyRevenue: number;
        todayRevenue: number;
        openTickets: number;
    };
    drivers: {
        total: number;
        available: number;
        busy: number;
    };
    ordersByStatus: Record<string, number>;
    areaStats: {
        id: string;
        name: string;
        users: number;
        orders: number;
        revenue: number;
    }[];
    topSellingProducts: TopProduct[];
}

interface RecentOrder {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    customer: { name: string };
}

interface PendingUser {
    id: string;
    name: string;
    phone: string;
    createdAt: string;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
    const [pendingApprovals, setPendingApprovals] = useState<PendingUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedArea, setSelectedArea] = useState('');

    const fetchData = async () => {
        try {
            const [statsRes, ordersRes, usersRes] = await Promise.all([
                fetch(`/api/stats${selectedArea ? `?serviceAreaId=${selectedArea}` : ''}`),
                fetch('/api/orders?limit=5'),
                fetch('/api/users?status=PENDING&limit=5'),
            ]);

            if (statsRes.ok) {
                const data = await statsRes.json();
                setStats(data);
            }

            if (ordersRes.ok) {
                const data = await ordersRes.json();
                setRecentOrders(data.orders || []);
            }

            if (usersRes.ok) {
                const data = await usersRes.json();
                setPendingApprovals(data.users || []);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [selectedArea]);

    const handleApproveUser = async (userId: string, status: string) => {
        try {
            await fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            fetchData();
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    if (loading || !stats) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="spinner"></div>
            </div>
        );
    }

    const statCards = [
        { title: 'إجمالي المستخدمين', value: formatNumber(stats.general.totalUsers), icon: Users, color: 'bg-blue-500', link: '/admin/users' },
        { title: 'بانتظار الموافقة', value: formatNumber(stats.general.pendingUsers), icon: UserCheck, color: 'bg-yellow-500', link: '/admin/users?status=PENDING', alert: stats.general.pendingUsers > 0 },
        { title: 'إجمالي المنتجات', value: formatNumber(stats.general.totalProducts), icon: Package, color: 'bg-purple-500', link: '/admin/products' },
        { title: 'منتجات منخفضة', value: formatNumber(stats.general.lowStockProducts), icon: AlertTriangle, color: 'bg-red-500', link: '/admin/products?lowStock=true', alert: stats.general.lowStockProducts > 0 },
        { title: 'إجمالي الطلبات', value: formatNumber(stats.general.totalOrders), icon: ShoppingCart, color: 'bg-green-500', link: '/admin/orders' },
        { title: 'طلبات اليوم', value: formatNumber(stats.general.todayOrders), icon: Clock, color: 'bg-indigo-500', link: '/admin/orders' },
        { title: 'طلبات معلقة', value: formatNumber(stats.general.pendingOrders), icon: Truck, color: 'bg-orange-500', link: '/admin/orders?status=PENDING', alert: stats.general.pendingOrders > 0 },
        { title: 'إيرادات اليوم', value: formatCurrency(stats.general.todayRevenue), icon: DollarSign, color: 'bg-emerald-500', link: '/admin/orders' },
    ];

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-secondary-800">لوحة التحكم</h1>
                    <p className="text-sm text-gray-500">مرحباً بك في لوحة إدارة ماركت باشا</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={selectedArea}
                        onChange={(e) => setSelectedArea(e.target.value)}
                        className="input w-auto text-sm"
                    >
                        <option value="">كل المناطق</option>
                        {stats.areaStats.map((area) => (
                            <option key={area.id} value={area.id}>{area.name}</option>
                        ))}
                    </select>
                    <button onClick={fetchData} className="btn btn-outline btn-sm" disabled={loading}>
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statCards.map((card, index) => (
                    <Link
                        key={index}
                        href={card.link}
                        className="card p-4 hover:shadow-lg transition-all duration-300 group relative"
                    >
                        {card.alert && (
                            <span className="absolute top-2 left-2 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        )}
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">{card.title}</p>
                                <p className="text-2xl font-bold text-secondary-800">{card.value}</p>
                            </div>
                            <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                                <card.icon className="w-6 h-6" />
                            </div>
                        </div>
                    </Link>
                ))}
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

            {/* Driver Stats & Tickets Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card p-4 bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                            <Truck className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">إجمالي السائقين</p>
                            <p className="text-xl font-bold text-secondary-800">{stats.drivers.total}</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4 bg-gradient-to-br from-green-50 to-green-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">سائقين متاحين</p>
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
                            <p className="text-sm text-gray-500">سائقين مشغولين</p>
                            <p className="text-xl font-bold text-orange-600">{stats.drivers.busy}</p>
                        </div>
                    </div>
                </div>
                <Link href="/admin/tickets" className="card p-4 bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white">
                            <Ticket className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">تذاكر مفتوحة</p>
                            <p className="text-xl font-bold text-purple-600">{stats.general.openTickets}</p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Per-Area Stats */}
            {stats.areaStats.length > 0 && (
                <div className="card">
                    <div className="card-header flex items-center justify-between">
                        <h2 className="font-bold text-secondary-800 flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            إحصائيات المناطق
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>المنطقة</th>
                                    <th>المستخدمين</th>
                                    <th>الطلبات</th>
                                    <th>الإيرادات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.areaStats.map((area) => (
                                    <tr key={area.id}>
                                        <td className="font-medium">{area.name}</td>
                                        <td>{formatNumber(area.users)}</td>
                                        <td>{formatNumber(area.orders)}</td>
                                        <td className="text-primary font-bold">{formatCurrency(area.revenue)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Top Selling Products */}
            {stats.topSellingProducts?.length > 0 && (
                <div className="card">
                    <div className="card-header flex items-center justify-between">
                        <h2 className="font-bold text-secondary-800 flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5 text-primary" />
                            أكثر المنتجات مبيعاً
                        </h2>
                    </div>
                    <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                        {stats.topSellingProducts.map((product, index) => (
                            <div key={product.id} className="p-3 flex items-center gap-3">
                                <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold">
                                    {index + 1}
                                </span>
                                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                    {product.image ? (
                                        <Image src={product.image} alt={product.name} width={48} height={48} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package className="w-6 h-6 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-secondary-800 truncate">{product.name}</p>
                                    <p className="text-sm text-gray-500">{product.quantitySold} قطعة مباعة</p>
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-primary">{formatCurrency(product.totalRevenue)}</p>
                                    <p className="text-xs text-gray-400">إجمالي المبيعات</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Activity Link & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="card">
                    <div className="card-header flex items-center justify-between">
                        <h2 className="font-bold text-secondary-800">آخر الطلبات</h2>
                        <Link href="/admin/orders" className="text-sm text-primary hover:underline">
                            عرض الكل
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {recentOrders.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                لا توجد طلبات حتى الآن
                            </div>
                        ) : (
                            recentOrders.map((order) => (
                                <Link
                                    key={order.id}
                                    href={`/admin/orders/${order.id}`}
                                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div>
                                        <p className="font-medium text-secondary-800">#{order.orderNumber}</p>
                                        <p className="text-sm text-gray-500">{order.customer?.name || '-'}</p>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-primary">{formatCurrency(Number(order.total))}</p>
                                        <span className={`badge ${getOrderStatusColor(order.status)}`}>
                                            {translateOrderStatus(order.status)}
                                        </span>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                {/* Pending Approvals */}
                <div className="card">
                    <div className="card-header flex items-center justify-between">
                        <h2 className="font-bold text-secondary-800">بانتظار الموافقة</h2>
                        <Link href="/admin/users?status=PENDING" className="text-sm text-primary hover:underline">
                            عرض الكل
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {pendingApprovals.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                لا يوجد مستخدمين بانتظار الموافقة
                            </div>
                        ) : (
                            pendingApprovals.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <Link href={`/admin/users/${user.id}`} className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                            <span className="text-yellow-600 font-bold">
                                                {user.name.charAt(0)}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-secondary-800">{user.name}</p>
                                            <p className="text-sm text-gray-500">{user.phone}</p>
                                        </div>
                                    </Link>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleApproveUser(user.id, 'APPROVED')}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleApproveUser(user.id, 'REJECTED')}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Activity Log Link */}
            <Link href="/admin/activity" className="card p-4 flex items-center justify-between hover:shadow-lg transition-shadow group">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-secondary-800">سجل النشاطات</h3>
                        <p className="text-sm text-gray-500">عرض جميع العمليات في النظام</p>
                    </div>
                </div>
                <span className="text-primary">عرض →</span>
            </Link>
        </div>
    );
}
