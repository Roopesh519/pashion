"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
    id: string; // Product ID
    name: string;
    price: number;
    image: string;
    size: string;
    color: string;
    quantity: number;
    slug: string;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (itemId: string, size: string, color: string) => void;
    updateQuantity: (itemId: string, size: string, color: string, quantity: number) => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
    isCartOpen: boolean;
    setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load from LocalStorage
    useEffect(() => {
        const savedCart = localStorage.getItem('pashion_cart');
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (e) {
                console.error('Failed to parse cart', e);
            }
        }
        setIsInitialized(true);
    }, []);

    // Save to LocalStorage
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('pashion_cart', JSON.stringify(items));
        }
    }, [items, isInitialized]);

    const addToCart = (newItem: CartItem) => {
        setItems((prev) => {
            const existing = prev.find(
                (item) => item.id === newItem.id && item.size === newItem.size && item.color === newItem.color
            );
            if (existing) {
                return prev.map((item) =>
                    item.id === newItem.id && item.size === newItem.size && item.color === newItem.color
                        ? { ...item, quantity: item.quantity + newItem.quantity }
                        : item
                );
            }
            return [...prev, newItem];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (id: string, size: string, color: string) => {
        setItems((prev) => prev.filter((item) => !(item.id === id && item.size === size && item.color === color)));
    };

    const updateQuantity = (id: string, size: string, color: string, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(id, size, color);
            return;
        }
        setItems((prev) =>
            prev.map((item) =>
                item.id === id && item.size === size && item.color === color ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => setItems([]);

    const cartCount = items.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartCount,
                cartTotal,
                isCartOpen,
                setIsCartOpen,
            }}
        >
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
