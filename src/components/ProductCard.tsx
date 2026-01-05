'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Package, Plus, Minus } from 'lucide-react';
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
    isFeatured: boolean;
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

export default function ProductCard({
    product,
    onAddToCart
}: ProductCardProps) {
    // Prioritize active offer discount
    let discount = 0;
    let finalPrice = Number(product.price);
    let showOfferBadge = false;

    if (product.activeOffer) {
        finalPrice = product.activeOffer.finalPrice;
        discount = Math.round(((Number(product.price) - finalPrice) / Number(product.price)) * 100);
        showOfferBadge = true;
    } else if (product.compareAtPrice && Number(product.compareAtPrice) > 0) {
        discount = Math.round(((Number(product.compareAtPrice) - Number(product.price)) / Number(product.compareAtPrice)) * 100);
    }

    const [isFav, setIsFav] = useState(false);

    // Get cart context to sync quantity
    const { items, updateQuantity, addToCart } = useCart();

    // Find current product in cart
    const cartItem = items.find(item => item.id === product.id);
    const quantity = cartItem?.quantity || 1;

    useEffect(() => {
        const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
        setIsFav(favs.includes(product.id));
    }, [product.id]);

    const toggleFav = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
        let newFavs;
        if (favs.includes(product.id)) {
            newFavs = favs.filter((id: string) => id !== product.id);
        } else {
            newFavs = [...favs, product.id];
        }
        localStorage.setItem('favorites', JSON.stringify(newFavs));
        setIsFav(!isFav);

        // Dispatch event for other components
        window.dispatchEvent(new Event('storage'));
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (cartItem) {
            // Product already in cart, update quantity
            updateQuantity(product.id, quantity);
        } else {
            // Add new product to cart with quantity 1
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

        if (cartItem) {
            // Update existing cart item
            if (quantity < product.stock) {
                updateQuantity(product.id, quantity + 1);
            }
        } else {
            // Add to cart with quantity 1
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

        if (cartItem && quantity > 1) {
            updateQuantity(product.id, quantity - 1);
        }
    };

    return (
        <div className="card group relative">
            <Link href={`/products/${product.id}`} className="block">
                <div className="relative aspect-square overflow-hidden bg-gray-100 rounded-t-2xl">
                    {product.image ? (
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Package className="w-12 h-12" />
                        </div>
                    )}

                    {discount > 0 && (
                        <span className={cn(
                            "absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-bold shadow-sm z-10",
                            showOfferBadge ? "bg-primary text-secondary-900" : "bg-red-500 text-white"
                        )}>
                            -{discount}%
                        </span>
                    )}

                    {product.stock <= 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                            <span className="bg-white text-gray-800 px-4 py-2 rounded-lg font-semibold shadow-lg">
                                نفذت الكمية
                            </span>
                        </div>
                    )}
                </div>
            </Link>

            <button
                onClick={toggleFav}
                className={cn(
                    "absolute top-3 left-3 w-9 h-9 rounded-full flex items-center justify-center transition-all z-20 shadow-sm",
                    isFav ? "bg-red-50 text-red-500" : "bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white"
                )}
            >
                <Heart className={cn("w-5 h-5", isFav && "fill-current")} />
            </button>

            <div className="p-4">
                <span className="text-xs text-primary-600 font-bold tracking-wide">{product.category.name}</span>
                <Link href={`/products/${product.id}`}>
                    <h3 className="font-bold text-secondary-900 mt-1 line-clamp-2 h-12 hover:text-primary transition-colors">
                        {product.name}
                    </h3>
                </Link>

                <div className="flex items-center gap-2 mt-2">
                    <span className="text-lg font-bold text-primary">
                        {formatCurrency(finalPrice)}
                    </span>
                    {(product.activeOffer || (product.compareAtPrice && Number(product.compareAtPrice) > 0)) && (
                        <span className="text-sm text-gray-400 line-through">
                            {formatCurrency(product.activeOffer ? Number(product.price) : Number(product.compareAtPrice))}
                        </span>
                    )}
                </div>

                <span className="text-xs text-gray-500 block mt-1">/ {product.unit}</span>

                <div className="flex items-center gap-2 mt-4">
                    {/* Quantity Counter */}
                    <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden h-10 bg-white">
                        <button
                            onClick={decrementQuantity}
                            disabled={quantity <= 1 || product.stock <= 0}
                            className="w-10 h-full flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <div className="px-4 font-bold text-secondary-900 min-w-[3rem] text-center">
                            {quantity}
                        </div>
                        <button
                            onClick={incrementQuantity}
                            disabled={quantity >= product.stock || product.stock <= 0}
                            className="w-10 h-full flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                        onClick={handleAddToCart}
                        disabled={product.stock <= 0}
                        className={cn(
                            "flex-1 btn btn-sm h-10 font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed",
                            cartItem ? "btn-secondary" : "btn-primary"
                        )}
                    >
                        <ShoppingCart className="w-4 h-4" />
                        {cartItem ? 'في السلة' : 'أضف'}
                    </button>
                </div>
            </div>
        </div>
    );
}
