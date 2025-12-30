'use client';

import { useState } from 'react';
import { Star, X, Send, Loader2 } from 'lucide-react';

interface ReviewModalProps {
    orderId: string;
    hasDriver: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ReviewModal({ orderId, hasDriver, onClose, onSuccess }: ReviewModalProps) {
    const [productRating, setProductRating] = useState(0);
    const [driverRating, setDriverRating] = useState(0);
    const [hoveredProduct, setHoveredProduct] = useState(0);
    const [hoveredDriver, setHoveredDriver] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    productRating,
                    driverRating: hasDriver && driverRating > 0 ? driverRating : undefined,
                    comment: comment.trim() || undefined,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'حدث خطأ');
                return;
            }

            onSuccess();
        } catch {
            setError('حدث خطأ في الاتصال');
        } finally {
            setLoading(false);
        }
    };

    const StarRating = ({
        rating,
        setRating,
        hovered,
        setHovered,
        label,
    }: {
        rating: number;
        setRating: (r: number) => void;
        hovered: number;
        setHovered: (r: number) => void;
        label: string;
    }) => (
        <div className="text-center">
            <p className="font-medium text-secondary-800 mb-3">{label}</p>
            <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHovered(star)}
                        onMouseLeave={() => setHovered(0)}
                        className="transition-transform hover:scale-110 focus:outline-none"
                    >
                        <Star
                            className={`w-10 h-10 sm:w-12 sm:h-12 transition-colors ${star <= (hovered || rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                                }`}
                        />
                    </button>
                ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
                {rating > 0 ? ['', 'سيء جداً', 'سيء', 'مقبول', 'جيد', 'ممتاز'][rating] : 'اختر تقييمك'}
            </p>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between rounded-t-2xl">
                    <h2 className="text-xl font-bold text-secondary-800">تقييم الطلب</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8">
                    {/* Product Rating */}
                    <StarRating
                        rating={productRating}
                        setRating={setProductRating}
                        hovered={hoveredProduct}
                        setHovered={setHoveredProduct}
                        label="كيف كانت جودة المنتجات؟"
                    />

                    {/* Driver Rating */}
                    {hasDriver && (
                        <StarRating
                            rating={driverRating}
                            setRating={setDriverRating}
                            hovered={hoveredDriver}
                            setHovered={setHoveredDriver}
                            label="كيف كان أداء السائق؟"
                        />
                    )}

                    {/* Comment */}
                    <div>
                        <label className="block font-medium text-secondary-800 mb-2">
                            تعليقك (اختياري)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="شاركنا رأيك في تجربتك..."
                            className="input min-h-24 resize-none"
                            maxLength={500}
                        />
                        <p className="text-xs text-gray-400 mt-1 text-left">{comment.length}/500</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-center text-sm">
                            {error}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 rounded-b-2xl">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="btn btn-primary w-full py-3"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                إرسال التقييم
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
