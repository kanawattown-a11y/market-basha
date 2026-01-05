'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Package, Plus, Minus, Check } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';

export interface Product {
    id: string;
    name: string;
    price: number;
    compareAtPrice?: number | null;
    image: string | null;
    stock: number;
    unit: string;
    category: { name: string };
    isFeatured?: boolean;
    description?: string | null;
    activeOffer?: {
        id: string;
        title: string;
        discountType: string;
        discountValue: number;
        finalPrice: number;
    };
}

interface ProductCardProps {
    product: Product;
    onAddToCart: (product: Product, quantity?: number) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
    // Calculate discount
    const hasDiscount = product.activeOffer || (product.compareAtPrice && Number(product.compareAtPrice) > 0);
    const displayPrice = product.activeOffer?.finalPrice ?? Number(product.price);
    const originalPrice = product.activeOffer ? Number(product.price) : Number(product.compareAtPrice || product.price);
    const discountPercent = hasDiscount
        ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
        : 0;

    const [isFavorite, setIsFavorite] = useState(false);
    const { items, updateQuantity, addToCart } = useCart();
    const cartItem = items.find((item) => item.id === product.id);

    const handleToggleFavorite = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsFavorite(!isFavorite);
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!cartItem) {
            addToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                stock: product.stock,
                activeOffer: product.activeOffer,
            }, 1);
        }
    };

    const incrementQuantity = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (cartItem && cartItem.quantity < product.stock) {
            updateQuantity(product.id, cartItem.quantity + 1);
        } else if (!cartItem) {
            addToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                stock: product.stock,
                activeOffer: product.activeOffer,
            }, 1);
        }
    };

    const decrementQuantity = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (cartItem && cartItem.quantity > 1) {
            updateQuantity(product.id, cartItem.quantity - 1);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100">
            {/* Mobile: Horizontal Layout */}
            <div className="sm:hidden flex gap-3 p-3">
                {/* Left: Product Details */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                    <span className="text-xs text-primary font-medium">{product.category.name}</span>

                    <Link href={`/products/${product.id}`}>
                        <h3 className="font-bold text-secondary-800 line-clamp-2 text-sm my-1 hover:text-primary transition-colors">
                            {product.name}
                        </h3>
                    </Link>

                    {product.description && (
                        <p className="text-xs text-gray-500 line-clamp-1 mb-1">{product.description}</p>
                    )}

                    <div className="flex items-center justify-between mt-auto">
                        <div className="flex flex-col">
                            <div className="flex items-baseline gap-1">
                                <span className="font-black text-primary text-lg">
                                    {formatCurrency(displayPrice)}
                                </span>
                                <span className="text-[10px] text-gray-400">/{product.unit}</span>
                            </div>
                            {hasDiscount && (
                                <span className="text-xs text-gray-400 line-through">
                                    {formatCurrency(originalPrice)}
                                </span>
                            )}
                        </div>

                        {!cartItem ? (
                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                                className={cn(
                                    'w-9 h-9 rounded-full flex items-center justify-center transition-all',
                                    product.stock === 0
                                        ? 'bg-gray-200 cursor-not-allowed'
                                        : 'bg-primary hover:bg-primary-600 text-secondary'
                                )}
                            >
                                <ShoppingCart className="w-4 h-4" />
                            </button>
                        ) : (
                            <div className="flex items-center gap-1">
                                <button onClick={decrementQuantity} className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                                    <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-sm font-bold w-6 text-center">{cartItem.quantity}</span>
                                <button onClick={incrementQuantity} disabled={cartItem.quantity >= product.stock} className="w-7 h-7 rounded-full bg-primary hover:bg-primary-600 text-secondary flex items-center justify-center disabled:opacity-50">
                                    <Plus className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Product Image */}
                <Link href={`/products/${product.id}`} className="flex-shrink-0">
                    <div className="relative w-28 h-28 bg-gray-100 rounded-lg overflow-hidden">
                        {product.image ? (
                            <Image src={product.image} alt={product.name} fill className="object-cover" />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Package className="w-10 h-10 text-gray-300" />
                            </div>
                        )}
                        {hasDiscount && (
                            <div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                                {discountPercent}%
                            </div>
                        )}
                        {product.stock === 0 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="text-white text-[10px] font-bold">نفذت</span>
                            </div>
                        )}
                    </div>
                </Link>
            </div>

            {/* Desktop: Vertical Grid Layout */}
            <div className="hidden sm:block">
                <Link href={`/products/${product.id}`}>
                    <div className="aspect-square relative bg-gray-100 overflow-hidden group">
                        {product.image ? (
                            <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Package className="w-16 h-16 text-gray-300" />
                            </div>
                        )}
                        {hasDiscount && (
                            <div className="absolute top-3 right-3 bg-red-500 text-white text-sm px-3 py-1 rounded-full font-bold shadow-lg">
                                {discountPercent}%
                            </div>
                        )}
                        {product.stock === 0 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="text-white text-lg font-bold">نفذت الكمية</span>
                            </div>
                        )}
                        <button onClick={handleToggleFavorite} className="absolute top-3 left-3 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                            <Heart className={cn('w-5 h-5', isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600')} />
                        </button>
                    </div>
                </Link>

                <div className="p-4">
                    <span className="text-xs text-primary font-medium">{product.category.name}</span>
                    <Link href={`/products/${product.id}`}>
                        <h3 className="font-bold text-secondary-800 line-clamp-2 mt-2 mb-3 hover:text-primary transition-colors">
                            {product.name}
                        </h3>
                    </Link>

                    <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-col flex-1">
                            <div className="flex items-baseline gap-2">
                                <span className="font-black text-primary text-xl">{formatCurrency(displayPrice)}</span>
                                <span className="text-xs text-gray-400">/{product.unit}</span>
                            </div>
                            {hasDiscount && (
                                <span className="text-sm text-gray-400 line-through">{formatCurrency(originalPrice)}</span>
                            )}
                        </div>

                        {!cartItem ? (
                            <button onClick={handleAddToCart} disabled={product.stock === 0} className={cn('px-4 py-2 rounded-xl font-semibold text-sm transition-all flex items-center gap-2', product.stock === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-600 text-secondary shadow-md')}>
                                <ShoppingCart className="w-4 h-4" />
                                <span className="hidden md:inline">إضافة</span>
                            </button>
                        ) : (
                            <div>
                                <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1 mb-2">
                                    <button onClick={decrementQuantity} className="w-8 h-8 rounded-lg bg-white hover:bg-gray-100 border border-gray-200 flex items-center justify-center">
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="text-base font-bold min-w-[2rem] text-center">{cartItem.quantity}</span>
                                    <button onClick={incrementQuantity} disabled={cartItem.quantity >= product.stock} className="w-8 h-8 rounded-lg bg-primary hover:bg-primary-600 text-secondary flex items-center justify-center disabled:opacity-50">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <button onClick={handleAddToCart} className="w-full px-3 py-1.5 rounded-lg bg-gray-200 text-secondary-700 text-xs font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center gap-1">
                                    <Check className="w-3 h-3" />
                                    في السلة
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
