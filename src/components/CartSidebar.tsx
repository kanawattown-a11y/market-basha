'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, X, Plus, Minus, Trash2, Package } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { CartItem } from '@/contexts/CartContext';

interface CartSidebarProps {
    items: CartItem[];
    isOpen: boolean;
    onClose: () => void;
    onUpdateQuantity: (id: string, quantity: number) => void;
    onRemove: (id: string) => void;
}

export default function CartSidebar({
    items,
    isOpen,
    onClose,
    onUpdateQuantity,
    onRemove
}: CartSidebarProps) {
    const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity" onClick={onClose} />
            )}
            <div className={cn(
                "fixed top-0 left-0 h-full w-full max-w-md bg-white z-50 transform transition-transform duration-300 shadow-2xl flex flex-col",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-bold text-secondary-800">سلة التسوق</h2>
                        <span className="bg-primary/20 text-primary-700 text-xs font-bold px-2 py-0.5 rounded-full">{items.length} عنصر</span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {items.length === 0 ? (
                        <div className="text-center py-20 flex flex-col items-center">
                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                <ShoppingCart className="w-10 h-10 text-gray-300 opacity-50" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">سلتك فارغة</h3>
                            <p className="text-gray-500 max-w-xs mx-auto">تصفح المنتجات وأضف ما يعجبك إلى السلة!</p>
                            <button onClick={onClose} className="btn btn-primary mt-6">تصفح المنتجات</button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-4 p-3 bg-white border border-gray-100 rounded-2xl hover:border-primary/20 hover:shadow-sm transition-all">
                                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                                        {item.image ? (
                                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <Package className="w-8 h-8" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-secondary-900 line-clamp-1 mb-1">{item.name}</h4>
                                        <p className="text-primary font-bold text-lg mb-2">{formatCurrency(Number(item.price))}</p>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center border border-gray-200 rounded-lg h-8">
                                                <button
                                                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                    className="w-8 h-full flex items-center justify-center hover:bg-gray-100 text-gray-600 disabled:opacity-50"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                                                <button
                                                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                                    disabled={item.quantity >= item.stock}
                                                    className="w-8 h-full flex items-center justify-center hover:bg-gray-100 text-gray-600 disabled:opacity-50"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => onRemove(item.id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors ml-auto p-1"
                                                title="حذف"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {items.length > 0 && (
                    <div className="p-5 border-t border-gray-100 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                        <div className="flex justify-between items-center mb-6 text-lg">
                            <span className="text-gray-600 font-medium">المجموع الكلي:</span>
                            <span className="text-2xl font-black text-primary">{formatCurrency(total)}</span>
                        </div>
                        <Link href="/checkout" className="btn btn-primary w-full btn-lg font-bold shadow-lg shadow-primary/20" onClick={onClose}>
                            أكمل الطلب الآن
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}
