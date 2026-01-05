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
import { useCart } from '@/contexts/CartContext';

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
    activeOffer?: {
        id: string;
        title: string;
        discountType: string;
        discountValue: number;
        finalPrice: number;
    };
}

export default function ProductDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);
    const [activeImage, setActiveImage] = useState<string | null>(null);
    const [isFav, setIsFav] = useState(false);

    useEffect(() => {
        if (!id) return;

        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/products/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setProduct(data.product);
                    setActiveImage(data.product.image);
                }
            } catch (error) {
                console.error('Error fetching product:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();

        // Check favorites
        const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
        setIsFav(favs.includes(id));
    }, [id]);

    // Cart Context
    const { addToCart: contextAddToCart } = useCart();

    const handleAddToCart = () => {
        if (!product) return;

        contextAddToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            stock: product.stock,
        });

        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    const toggleFav = () => {
        const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
        let newFavs;
        if (favs.includes(id)) {
            newFavs = favs.filter((itemId: string) => itemId !== id);
        } else {
            newFavs = [...favs, id];
        }
        localStorage.setItem('favorites', JSON.stringify(newFavs));
        setIsFav(!isFav);
        window.dispatchEvent(new Event('storage'));
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

    const discount = product.compareAtPrice && Number(product.compareAtPrice) > 0
        ? Math.round((1 - Number(product.price) / Number(product.compareAtPrice)) * 100)
        : 0;

    const allImages = [product.image, ...(product.images || [])].filter(Boolean) as string[];

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="container mx-auto px-4 py-6">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 overflow-x-auto whitespace-nowrap pb-2">
                    <Link href="/" className="hover:text-primary">الرئيسية</Link>
                    <ChevronLeft className="w-4 h-4 shrink-0" />
                    <Link href="/products" className="hover:text-primary">المنتجات</Link>
                    <ChevronLeft className="w-4 h-4 shrink-0" />
                    <Link href={`/products?category=${product.category.id}`} className="hover:text-primary">
                        {product.category.name}
                    </Link>
                    <ChevronLeft className="w-4 h-4 shrink-0" />
                    <span className="text-secondary-800 font-medium">{product.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Product Image Gallery */}
                    <div className="space-y-4">
                        <div className="card overflow-hidden">
                            <div className="aspect-square relative bg-white">
                                {activeImage ? (
                                    <Image
                                        src={activeImage}
                                        alt={product.name}
                                        fill
                                        className="object-contain p-4"
                                        priority
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Package className="w-24 h-24 text-gray-300" />
                                    </div>
                                )}

                                {discount > 0 && (
                                    <span className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full font-bold shadow-md z-10">
                                        خصم {discount}%
                                    </span>
                                )}

                                <button
                                    onClick={toggleFav}
                                    className="absolute top-4 left-4 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors z-10"
                                >
                                    <Heart className={cn("w-6 h-6", isFav && "fill-red-500 text-red-500")} />
                                </button>
                            </div>
                        </div>

                        {/* Thumbnails */}
                        {allImages.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                {allImages.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveImage(img)}
                                        className={cn(
                                            "relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all",
                                            activeImage === img ? "border-primary ring-2 ring-primary/20" : "border-transparent opacity-70 hover:opacity-100"
                                        )}
                                    >
                                        <Image src={img} alt={`${product.name} ${index + 1}`} fill className="object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        <div>
                            <Link
                                href={`/products?category=${product.category.id}`}
                                className="text-primary text-sm font-bold hover:underline"
                            >
                                {product.category.name}
                            </Link>
                            <h1 className="text-2xl md:text-3xl font-black text-secondary-900 mt-2 leading-tight">
                                {product.name}
                            </h1>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-3 pb-4 border-b border-gray-100">
                            <span className="text-4xl font-black text-primary">
                                {formatCurrency(Number(product.price))}
                            </span>
                            <span className="text-gray-500 text-lg">/{product.unit}</span>
                            {product.compareAtPrice && Number(product.compareAtPrice) > 0 && (
                                <span className="text-xl text-gray-400 line-through decoration-2">
                                    {formatCurrency(Number(product.compareAtPrice))}
                                </span>
                            )}
                        </div>

                        {/* Stock Status */}
                        <div className={cn(
                            "flex items-center gap-2 text-sm font-medium p-3 rounded-xl w-fit",
                            product.stock > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                        )}>
                            {product.stock > 0 ? (
                                <>
                                    <Check className="w-5 h-5" />
                                    <span>متوفر في المخزون ({product.stock} {product.unit})</span>
                                </>
                            ) : (
                                <span>غير متوفر حالياً</span>
                            )}
                        </div>

                        {/* Description */}
                        {product.description && (
                            <div className="py-4">
                                <h3 className="font-bold text-secondary-900 mb-3 text-lg">تفاصيل المنتج</h3>
                                <p className="text-gray-600 leading-relaxed text-lg">{product.description}</p>
                            </div>
                        )}

                        {/* Quantity Selector */}
                        <div className="flex items-center gap-6 pt-4">
                            <span className="text-gray-900 font-bold">الكمية:</span>
                            <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                <button
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600"
                                >
                                    <Minus className="w-5 h-5" />
                                </button>
                                <span className="w-16 text-center font-bold text-lg">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                                    disabled={quantity >= product.stock}
                                    className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 text-gray-600"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Add to Cart */}
                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                                className={cn(
                                    "btn btn-xl flex-1 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1",
                                    addedToCart
                                        ? "bg-green-500 text-white border-green-500 scale-100"
                                        : "btn-primary scale-100"
                                )}
                            >
                                {addedToCart ? (
                                    <>
                                        <Check className="w-6 h-6 animate-bounce" />
                                        <span className="font-bold text-lg">تمت الإضافة بنجاح</span>
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart className="w-6 h-6" />
                                        <span className="font-bold text-lg">إضافة للسلة</span>
                                    </>
                                )}
                            </button>
                            <button
                                onClick={toggleFav}
                                className={cn(
                                    "btn btn-xl btn-outline w-16 p-0 border-2",
                                    isFav ? "border-red-500 text-red-500 bg-red-50" : "border-gray-200 text-gray-400 hover:border-red-500 hover:text-red-500"
                                )}
                            >
                                <Heart className={cn("w-6 h-6", isFav && "fill-current")} />
                            </button>
                        </div>

                        {/* Delivery Info */}
                        <div className="card p-5 bg-gray-50/50 border border-gray-100 mt-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                                    <Truck className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="font-bold text-secondary-900 text-lg">توصيل سريع وموثوق</p>
                                    <p className="text-gray-500">اطلب الآن ويصلك طلبك خلال ساعات العمل الرسمية</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
