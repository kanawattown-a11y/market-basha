'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface CartItem {
    id: string;
    name: string;
    price: number | string;
    image: string | null;
    stock: number;
    quantity: number;
    activeOffer?: {
        id: string;
        title: string;
        discountType: string;
        discountValue: number;
        finalPrice: number;
    };
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Omit<CartItem, 'quantity'>) => void;
    updateQuantity: (id: string, quantity: number) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
    totalSavings: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'cart';

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const savedCart = localStorage.getItem(CART_STORAGE_KEY);
                if (savedCart) {
                    const parsed = JSON.parse(savedCart);
                    if (Array.isArray(parsed)) {
                        setItems(parsed);
                    }
                }
            } catch (e) {
                console.error('Error loading cart from localStorage:', e);
                localStorage.removeItem(CART_STORAGE_KEY);
            }
            setIsLoaded(true);
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (isLoaded && typeof window !== 'undefined') {
            try {
                localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
                // Dispatch custom event for same-tab updates
                window.dispatchEvent(new CustomEvent('cartUpdate', { detail: items }));
            } catch (e) {
                console.error('Error saving cart to localStorage:', e);
            }
        }
    }, [items, isLoaded]);

    // Listen for cart updates from other tabs
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === CART_STORAGE_KEY && e.newValue) {
                try {
                    const parsed = JSON.parse(e.newValue);
                    if (Array.isArray(parsed)) {
                        setItems(parsed);
                    }
                } catch (err) {
                    console.error('Error parsing cart from storage event:', err);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const addToCart = useCallback((product: Omit<CartItem, 'quantity'>) => {
        setItems(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: Math.min(item.quantity + 1, item.stock) }
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    }, []);

    const updateQuantity = useCallback((id: string, quantity: number) => {
        if (quantity < 1) return;
        setItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, quantity: Math.min(quantity, item.stock) } : item
            )
        );
    }, []);

    const removeFromCart = useCallback((id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

    // Calculate total using offer prices if available
    const cartTotal = items.reduce((sum, item) => {
        const price = item.activeOffer ? item.activeOffer.finalPrice : Number(item.price);
        return sum + price * item.quantity;
    }, 0);

    // Calculate total savings from offers
    const totalSavings = items.reduce((sum, item) => {
        if (item.activeOffer) {
            const originalPrice = Number(item.price);
            const discount = (originalPrice - item.activeOffer.finalPrice) * item.quantity;
            return sum + discount;
        }
        return sum;
    }, 0);

    return (
        <CartContext.Provider value={{
            items,
            addToCart,
            updateQuantity,
            removeFromCart,
            clearCart,
            cartCount,
            cartTotal,
            totalSavings,
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
