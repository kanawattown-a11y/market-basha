'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ShoppingCart,
    MapPin,
    Plus,
    ChevronRight,
    CreditCard,
    Truck,
    Package,
    AlertCircle,
    Check
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';

interface Address {
    id: string;
    title: string;
    fullAddress: string;
    area: string;
    isDefault: boolean;
}

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string | null;
    stock: number;
}

interface ServiceArea {
    name: string;
    deliveryFee: number;
}

export default function CheckoutPage() {
    const router = useRouter();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string>('');
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch addresses and service areas in parallel
                const [addressesRes, areasRes] = await Promise.all([
                    fetch('/api/addresses'),
                    fetch('/api/service-areas?active=true')
                ]);

                if (addressesRes.ok) {
                    const data = await addressesRes.json();
                    setAddresses(data.addresses);
                    const defaultAddress = data.addresses.find((a: Address) => a.isDefault);
                    if (defaultAddress) {
                        setSelectedAddressId(defaultAddress.id);
                    }
                }

                if (areasRes.ok) {
                    const data = await areasRes.json();
                    setServiceAreas(data.areas);
                }

                // Process Cart
                const savedCart = localStorage.getItem('cart');
                if (savedCart) {
                    const parsedCart = JSON.parse(savedCart);
                    if (parsedCart.length > 0) {
                        // Extract IDs and Quantity map
                        const cartMap = new Map(parsedCart.map((item: any) => [item.id, item.quantity]));
                        const ids = Array.from(cartMap.keys());

                        // Fetch Fresh Product Details
                        const productsRes = await fetch(`/api/products?ids=${ids.join(',')}&limit=${ids.length}`);
                        if (productsRes.ok) {
                            const data = await productsRes.json();
                            const products = data.products;

                            // Merge fresh details with cart quantity
                            const mergedCart = products.map((p: any) => ({
                                ...p,
                                quantity: cartMap.get(p.id) || 1
                            }));
                            setCartItems(mergedCart);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const selectedAddress = addresses.find(a => a.id === selectedAddressId);
    const deliveryFee = selectedAddress
        ? serviceAreas.find(a => a.name === selectedAddress.area)?.deliveryFee || 0
        : 0;
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal + Number(deliveryFee);

    const handleSubmit = async () => {
        if (!selectedAddressId) {
            setError('يرجى اختيار عنوان التوصيل');
            return;
        }

        if (cartItems.length === 0) {
            setError('السلة فارغة');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    addressId: selectedAddressId,
                    items: cartItems.map(item => ({
                        productId: item.id,
                        quantity: item.quantity,
                    })),
                    notes: notes || undefined,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'حدث خطأ في إنشاء الطلب');
                return;
            }

            // Clear cart
            localStorage.removeItem('cart');

            // Redirect to order tracking
            router.push(`/orders/${data.order.id}?success=true`);
        } catch {
            setError('حدث خطأ في الاتصال');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="spinner mx-auto mb-4"></div>
                    <p className="text-gray-500">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h2 className="text-xl font-bold text-secondary-800 mb-2">السلة فارغة</h2>
                    <p className="text-gray-500 mb-6">لم تقم بإضافة أي منتجات بعد</p>
                    <Link href="/" className="btn btn-primary">
                        تصفح المنتجات
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                                <span className="text-secondary font-bold text-xl">م</span>
                            </div>
                            <span className="font-bold text-secondary-800 hidden sm:block">ماركت باشا</span>
                        </Link>
                        <div className="flex items-center text-gray-400 text-sm">
                            <span>السلة</span>
                            <ChevronRight className="w-4 h-4 mx-2" />
                            <span className="text-primary font-medium">إتمام الطلب</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Address Selection */}
                        <div className="card">
                            <div className="card-header flex items-center justify-between">
                                <h2 className="font-bold text-secondary-800 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-primary" />
                                    عنوان التوصيل
                                </h2>
                                <Link href="/account/addresses/new" className="text-sm text-primary hover:underline flex items-center gap-1">
                                    <Plus className="w-4 h-4" />
                                    إضافة عنوان
                                </Link>
                            </div>
                            <div className="card-body">
                                {addresses.length === 0 ? (
                                    <div className="text-center py-6">
                                        <MapPin className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                                        <p className="text-gray-500 mb-4">لا توجد عناوين محفوظة</p>
                                        <Link href="/account/addresses/new" className="btn btn-primary btn-sm">
                                            إضافة عنوان جديد
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {addresses.map((address) => (
                                            <label
                                                key={address.id}
                                                className={cn(
                                                    "flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                                                    selectedAddressId === address.id
                                                        ? "border-primary bg-primary/5"
                                                        : "border-gray-200 hover:border-gray-300"
                                                )}
                                            >
                                                <input
                                                    type="radio"
                                                    name="address"
                                                    value={address.id}
                                                    checked={selectedAddressId === address.id}
                                                    onChange={(e) => setSelectedAddressId(e.target.value)}
                                                    className="mt-1"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-secondary-800">{address.title}</span>
                                                        {address.isDefault && (
                                                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                                                افتراضي
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-gray-600 text-sm mt-1">{address.fullAddress}</p>
                                                    <p className="text-gray-400 text-sm">{address.area}</p>
                                                </div>
                                                {selectedAddressId === address.id && (
                                                    <Check className="w-5 h-5 text-primary" />
                                                )}
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Notes */}
                        <div className="card">
                            <div className="card-header">
                                <h2 className="font-bold text-secondary-800">ملاحظات الطلب (اختياري)</h2>
                            </div>
                            <div className="card-body">
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="أضف أي ملاحظات خاصة بالطلب..."
                                    className="input min-h-24 resize-none"
                                    maxLength={500}
                                />
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="card">
                            <div className="card-header">
                                <h2 className="font-bold text-secondary-800 flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-primary" />
                                    طريقة الدفع
                                </h2>
                            </div>
                            <div className="card-body">
                                <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                        <Truck className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-green-800">الدفع عند الاستلام</p>
                                        <p className="text-sm text-green-600">ادفع نقداً عند استلام طلبك</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="card sticky top-24">
                            <div className="card-header">
                                <h2 className="font-bold text-secondary-800">ملخص الطلب</h2>
                            </div>
                            <div className="card-body space-y-4">
                                {/* Items */}
                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <Package className="w-6 h-6 text-gray-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-secondary-800 line-clamp-1">{item.name}</p>
                                                <p className="text-sm text-gray-500">{item.quantity} × {formatCurrency(item.price)}</p>
                                            </div>
                                            <p className="font-semibold text-secondary-800">
                                                {formatCurrency(item.price * item.quantity)}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <hr />

                                {/* Totals */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-gray-600">
                                        <span>المجموع الفرعي</span>
                                        <span>{formatCurrency(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>رسوم التوصيل</span>
                                        <span>{formatCurrency(Number(deliveryFee))}</span>
                                    </div>
                                    <hr />
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>الإجمالي</span>
                                        <span className="text-primary">{formatCurrency(total)}</span>
                                    </div>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                                        <AlertCircle className="w-5 h-5" />
                                        {error}
                                    </div>
                                )}

                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting || !selectedAddressId}
                                    className="btn btn-primary w-full btn-lg"
                                >
                                    {submitting ? (
                                        <div className="spinner" />
                                    ) : (
                                        <>
                                            <Check className="w-5 h-5" />
                                            تأكيد الطلب
                                        </>
                                    )}
                                </button>

                                <p className="text-xs text-gray-400 text-center">
                                    بالضغط على "تأكيد الطلب" فإنك توافق على شروط الاستخدام
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
