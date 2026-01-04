'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Package } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';

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
}

interface ProductCardProps {
    product: Product;
    onAddToCart: (product: Product) => void;
}

export default function ProductCard({
    product,
    onAddToCart
}: ProductCardProps) {
    const discount = product.compareAtPrice && Number(product.compareAtPrice) > 0
        ? Math.round(((Number(product.compareAtPrice) - Number(product.price)) / Number(product.compareAtPrice)) * 100)
        : 0;

    const [isFav, setIsFav] = useState(false);

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
                        <span className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm z-10">
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
                    <span className="text-lg font-bold text-primary">{formatCurrency(Number(product.price))}</span>
                    {product.compareAtPrice && Number(product.compareAtPrice) > 0 && (
                        <span className="text-sm text-gray-400 line-through">
                            {formatCurrency(Number(product.compareAtPrice))}
                        </span>
                    )}
                </div>

                <span className="text-xs text-gray-500 block mt-1">/ {product.unit}</span>

                <button
                    onClick={(e) => {
                        e.preventDefault();
                        onAddToCart(product);
                    }}
                    disabled={product.stock <= 0}
                    className="w-full btn btn-primary btn-sm mt-4 font-bold shadow-sm"
                >
                    <ShoppingCart className="w-4 h-4" />
                    أضف للسلة
                </button>
            </div>
        </div>
    );
}
