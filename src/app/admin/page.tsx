import { prisma } from '@/lib/prisma';
import {
    Users,
    Package,
    ShoppingCart,
    DollarSign,
    TrendingUp,
    UserCheck,
    UserX,
    Truck,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle
} from 'lucide-react';
import { formatCurrency, formatNumber, translateOrderStatus, getOrderStatusColor } from '@/lib/utils';
import Link from 'next/link';

async function getStatistics() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
        totalUsers,
        pendingUsers,
        totalProducts,
        lowStockProducts,
        totalOrders,
        todayOrders,
        pendingOrders,
        monthlyRevenue,
        recentOrders,
        pendingApprovals,
    ] = await Promise.all([
        // Total users
        prisma.user.count({ where: { role: 'USER' } }),
        // Pending users
        prisma.user.count({ where: { status: 'PENDING' } }),
        // Total products
        prisma.product.count({ where: { isActive: true } }),
        // Low stock products
        prisma.product.count({
            where: {
                isActive: true,
                trackStock: true,
                stock: { lte: prisma.product.fields.lowStockThreshold },
            },
        }),
        // Total orders
        prisma.order.count(),
        // Today's orders
        prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
        // Pending orders
        prisma.order.count({ where: { status: 'PENDING' } }),
        // Monthly revenue
        prisma.order.aggregate({
            where: {
                createdAt: { gte: startOfMonth },
                status: 'DELIVERED',
            },
            _sum: { total: true },
        }),
        // Recent orders
        prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                customer: { select: { name: true } },
            },
        }),
        // Pending user approvals
        prisma.user.findMany({
            where: { status: 'PENDING' },
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, name: true, phone: true, createdAt: true },
        }),
    ]);

    return {
        totalUsers,
        pendingUsers,
        totalProducts,
        lowStockProducts,
        totalOrders,
        todayOrders,
        pendingOrders,
        monthlyRevenue: Number(monthlyRevenue._sum.total || 0),
        recentOrders,
        pendingApprovals,
    };
}

export default async function AdminDashboard() {
    const stats = await getStatistics();

    const statCards = [
        {
            title: 'إجمالي المستخدمين',
            value: formatNumber(stats.totalUsers),
            icon: Users,
            color: 'bg-blue-500',
            link: '/admin/users',
        },
        {
            title: 'بانتظار الموافقة',
            value: formatNumber(stats.pendingUsers),
            icon: UserCheck,
            color: 'bg-yellow-500',
            link: '/admin/users?status=PENDING',
            alert: stats.pendingUsers > 0,
        },
        {
            title: 'إجمالي المنتجات',
            value: formatNumber(stats.totalProducts),
            icon: Package,
            color: 'bg-purple-500',
            link: '/admin/products',
        },
        {
            title: 'منتجات منخفضة',
            value: formatNumber(stats.lowStockProducts),
            icon: AlertTriangle,
            color: 'bg-red-500',
            link: '/admin/products?lowStock=true',
            alert: stats.lowStockProducts > 0,
        },
        {
            title: 'إجمالي الطلبات',
            value: formatNumber(stats.totalOrders),
            icon: ShoppingCart,
            color: 'bg-green-500',
            link: '/admin/orders',
        },
        {
            title: 'طلبات اليوم',
            value: formatNumber(stats.todayOrders),
            icon: Clock,
            color: 'bg-indigo-500',
            link: '/admin/orders',
        },
        {
            title: 'طلبات معلقة',
            value: formatNumber(stats.pendingOrders),
            icon: Truck,
            color: 'bg-orange-500',
            link: '/admin/orders?status=PENDING',
            alert: stats.pendingOrders > 0,
        },
        {
            title: 'إيرادات الشهر',
            value: formatCurrency(stats.monthlyRevenue),
            icon: DollarSign,
            color: 'bg-emerald-500',
            link: '/admin/orders',
        },
    ];

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-xl md:text-2xl font-bold text-secondary-800">لوحة التحكم</h1>
                <p className="text-sm text-gray-500">مرحباً بك في لوحة إدارة ماركت باشا</p>
            </div>

            {/* Stats Grid */}
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

            {/* Recent Activity */}
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
                        {stats.recentOrders.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                لا توجد طلبات حتى الآن
                            </div>
                        ) : (
                            stats.recentOrders.map((order) => (
                                <Link
                                    key={order.id}
                                    href={`/admin/orders/${order.id}`}
                                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div>
                                        <p className="font-medium text-secondary-800">#{order.orderNumber}</p>
                                        <p className="text-sm text-gray-500">{order.customer.name}</p>
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
                        {stats.pendingApprovals.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                لا يوجد مستخدمين بانتظار الموافقة
                            </div>
                        ) : (
                            stats.pendingApprovals.map((user) => (
                                <Link
                                    key={user.id}
                                    href={`/admin/users/${user.id}`}
                                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                            <span className="text-yellow-600 font-bold">
                                                {user.name.charAt(0)}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-secondary-800">{user.name}</p>
                                            <p className="text-sm text-gray-500">{user.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                            <CheckCircle className="w-5 h-5" />
                                        </button>
                                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
