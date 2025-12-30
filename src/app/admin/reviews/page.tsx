'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Star,
    MessageSquare,
    ChevronLeft,
    ChevronRight,
    Package,
    User,
    Truck,
    Filter,
    TrendingUp,
    TrendingDown,
    RefreshCw,
    Trash2
} from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';

interface Review {
    id: string;
    productRating: number;
    driverRating: number | null;
    comment: string | null;
    createdAt: string;
    user: { id: string; name: string; phone: string };
    order: {
        id: string;
        orderNumber: string;
        driver: { id: string; name: string } | null;
        items: {
            product: { id: string; name: string; image: string | null };
        }[];
    };
}

interface Stats {
    totalReviews: number;
    avgProductRating: number;
    avgDriverRating: number;
}

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState<'all' | 'positive' | 'negative'>('all');

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
            });

            if (filter === 'positive') {
                params.set('minRating', '4');
            } else if (filter === 'negative') {
                params.set('maxRating', '2');
            }

            const res = await fetch(`/api/reviews?${params}`);
            if (res.ok) {
                const data = await res.json();
                setReviews(data.reviews);
                setStats(data.stats);
                setTotalPages(data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [page, filter]);

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا التقييم؟')) return;

        try {
            const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchReviews();
            }
        } catch (error) {
            console.error('Error deleting review:', error);
        }
    };

    const renderStars = (rating: number) => (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                />
            ))}
        </div>
    );

    const getRatingColor = (rating: number) => {
        if (rating >= 4) return 'text-green-600 bg-green-50';
        if (rating >= 3) return 'text-yellow-600 bg-yellow-50';
        return 'text-red-600 bg-red-50';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-800">التقييمات</h1>
                    <p className="text-gray-500">إدارة ومراجعة تقييمات العملاء</p>
                </div>
                <button onClick={fetchReviews} className="btn btn-outline btn-sm" disabled={loading}>
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="card p-4 bg-gradient-to-br from-blue-50 to-blue-100">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white">
                                <Star className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">إجمالي التقييمات</p>
                                <p className="text-2xl font-bold text-blue-700">{stats.totalReviews}</p>
                            </div>
                        </div>
                    </div>
                    <div className="card p-4 bg-gradient-to-br from-green-50 to-green-100">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white">
                                <Package className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">متوسط تقييم المنتجات</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-2xl font-bold text-green-700">{stats.avgProductRating.toFixed(1)}</p>
                                    {renderStars(Math.round(stats.avgProductRating))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="card p-4 bg-gradient-to-br from-purple-50 to-purple-100">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center text-white">
                                <Truck className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">متوسط تقييم السائقين</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-2xl font-bold text-purple-700">{stats.avgDriverRating.toFixed(1)}</p>
                                    {renderStars(Math.round(stats.avgDriverRating))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="card p-4">
                <div className="flex items-center gap-2 flex-wrap">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <button
                        onClick={() => { setFilter('all'); setPage(1); }}
                        className={`px-4 py-2 rounded-lg transition-colors ${filter === 'all' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                    >
                        الكل
                    </button>
                    <button
                        onClick={() => { setFilter('positive'); setPage(1); }}
                        className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1 ${filter === 'positive' ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                    >
                        <TrendingUp className="w-4 h-4" />
                        إيجابي (4-5)
                    </button>
                    <button
                        onClick={() => { setFilter('negative'); setPage(1); }}
                        className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1 ${filter === 'negative' ? 'bg-red-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                    >
                        <TrendingDown className="w-4 h-4" />
                        سلبي (1-2)
                    </button>
                </div>
            </div>

            {/* Reviews List */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="spinner mx-auto"></div>
                </div>
            ) : reviews.length === 0 ? (
                <div className="card p-12 text-center">
                    <Star className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">لا توجد تقييمات</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div key={review.id} className="card p-4">
                            <div className="flex items-start gap-4">
                                {/* User Avatar */}
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                                    <User className="w-6 h-6 text-primary" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    {/* Header */}
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div>
                                            <p className="font-bold text-secondary-800">{review.user.name}</p>
                                            <p className="text-xs text-gray-500">{review.user.phone}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/admin/orders/${review.order.id}`}
                                                className="text-xs text-primary hover:underline"
                                            >
                                                طلب #{review.order.orderNumber}
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(review.id)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Ratings */}
                                    <div className="flex flex-wrap gap-4 mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-500">المنتجات:</span>
                                            {renderStars(review.productRating)}
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRatingColor(review.productRating)}`}>
                                                {review.productRating}/5
                                            </span>
                                        </div>
                                        {review.driverRating && review.order.driver && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-500">السائق ({review.order.driver.name}):</span>
                                                {renderStars(review.driverRating)}
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRatingColor(review.driverRating)}`}>
                                                    {review.driverRating}/5
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Comment */}
                                    {review.comment && (
                                        <div className="bg-gray-50 p-3 rounded-lg mb-3">
                                            <div className="flex items-start gap-2">
                                                <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                                <p className="text-gray-700 text-sm">{review.comment}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Products */}
                                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                                        {review.order.items.slice(0, 4).map((item, i) => (
                                            <div key={i} className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                                {item.product.image ? (
                                                    <Image
                                                        src={item.product.image}
                                                        alt={item.product.name}
                                                        width={40}
                                                        height={40}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="w-4 h-4 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {review.order.items.length > 4 && (
                                            <span className="text-xs text-gray-500">+{review.order.items.length - 4}</span>
                                        )}
                                    </div>

                                    {/* Footer */}
                                    <p className="text-xs text-gray-400 mt-2">{formatRelativeTime(review.createdAt)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="btn btn-sm bg-white border border-gray-200 disabled:opacity-50"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 text-sm">
                        {page} / {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="btn btn-sm bg-white border border-gray-200 disabled:opacity-50"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
