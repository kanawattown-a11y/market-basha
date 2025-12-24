'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
    Package,
    ShoppingCart,
    Plus,
    Minus,
    ChevronLeft,
    Heart,
    Share2,
    Check,
    Truck
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Product {
    id: string;
    name: string;
    description: string | null;
    image: string | null;
    images: string[];
    price: number;
    compareAtPrice: number | null;
    unit: string;
    stock: number;
    trackStock: boolean;
    category: { id: string; name: string };
}

export default function ProductDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);

    useEffect(() => {
        if (!id) return;

        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/products/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setProduct(data.product);
                }
            } catch (error) {
                console.error('Error fetching product:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const addToCart = () => {
        if (!product) return;

        const savedCart = localStorage.getItem('cart');
        const cart = savedCart ? JSON.parse(savedCart) : [];

        const existing = cart.find((item: { id: string }) => item.id === product.id);
        if (existing) {
            existing.quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity,
                stock: product.stock,
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="flex items-center justify-center py-24">
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="flex items-center justify-center py-24">
                    <div className="text-center">
                        <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <h2 className="text-xl font-bold text-secondary-800 mb-2">المنتج غير موجود</h2>
                        <Link href="/products" className="btn btn-primary">
                            تصفح المنتجات
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const discount = product.compareAtPrice
        ? Math.round((1 - Number(product.price) / Number(product.compareAtPrice)) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="container mx-auto px-4 py-6">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <Link href="/" className="hover:text-primary">الرئيسية</Link>
                    <ChevronLeft className="w-4 h-4" />
                    <Link href="/products" className="hover:text-primary">المنتجات</Link>
                    <ChevronLeft className="w-4 h-4" />
                    <Link href={`/products?category=${product.category.id}`} className="hover:text-primary">
                        {product.category.name}
                    </Link>
                    <ChevronLeft className="w-4 h-4" />
                    <span className="text-secondary-800 font-medium line-clamp-1">{product.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Product Image */}
                    <div className="card overflow-hidden">
                        <div className="aspect-square relative bg-gray-100">
                            {product.image ? (
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-24 h-24 text-gray-300" />
                                </div>
                            )}

                            {discount > 0 && (
                                <span className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full font-bold">
                                    خصم {discount}%
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        <div>
                            <Link
                                href={`/products?category=${product.category.id}`}
                                className="text-primary text-sm font-medium hover:underline"
                            >
                                {product.category.name}
                            </Link>
                            <h1 className="text-2xl md:text-3xl font-bold text-secondary-800 mt-2">
                                {product.name}
                            </h1>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-bold text-primary">
                                {formatCurrency(Number(product.price))}
                            </span>
                            <span className="text-gray-400">/{product.unit}</span>
                            {product.compareAtPrice && (
                                <span className="text-lg text-gray-400 line-through">
                                    {formatCurrency(Number(product.compareAtPrice))}
                                </span>
                            )}
                        </div>

                        {/* Stock Status */}
                        <div className={cn(
                            "flex items-center gap-2 text-sm",
                            product.stock > 0 ? "text-green-600" : "text-red-600"
                        )}>
                            {product.stock > 0 ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    <span>متوفر في المخزون ({product.stock} {product.unit})</span>
                                </>
                            ) : (
                                <span>غير متوفر حالياً</span>
                            )}
                        </div>

                        {/* Quantity Selector */}
                        <div className="flex items-center gap-4">
                            <span className="text-gray-600">الكمية:</span>
                            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                                <button
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-12 text-center font-semibold">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                                    disabled={quantity >= product.stock}
                                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Add to Cart */}
                        <div className="flex gap-3">
                            <button
                                onClick={addToCart}
                                disabled={product.stock === 0}
                                className={cn(
                                    "btn btn-lg flex-1 transition-all",
                                    addedToCart
                                        ? "bg-green-500 text-white"
                                        : "btn-primary"
                                )}
                            >
                                {addedToCart ? (
                                    <>
                                        <Check className="w-5 h-5" />
                                        تمت الإضافة
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart className="w-5 h-5" />
                                        إضافة للسلة
                                    </>
                                )}
                            </button>
                            <button className="btn btn-lg btn-outline w-12 p-0">
                                <Heart className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Delivery Info */}
                        <div className="card p-4 bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                    <Truck className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-semibold text-secondary-800">التوصيل السريع</p>
                                    <p className="text-sm text-gray-500">يصلك طلبك خلال ساعات</p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {product.description && (
                            <div>
                                <h3 className="font-bold text-secondary-800 mb-2">وصف المنتج</h3>
                                <p className="text-gray-600 leading-relaxed">{product.description}</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
