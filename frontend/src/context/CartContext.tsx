"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Track } from "@/services/api";

interface CartContextType {
  cartItems: Track[];
  addToCart: (track: Track) => void;
  removeFromCart: (trackId: string) => void;
  clearCart: () => void;
  isInCart: (trackId: string) => boolean;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  totalPrice: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "oziris_cart_v1";

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<Track[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Cargar carrito guardado en localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error("Error al cargar carrito:", e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Guardar cambios en localStorage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.error("Error al guardar carrito:", e);
    }
  }, [cartItems, isInitialized]);

  const addToCart = (track: Track) => {
    setCartItems((prev) => {
      if (prev.some((item) => item.id === track.id)) {
        return prev;
      }
      return [...prev, track];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (trackId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== trackId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const isInCart = (trackId: string) => {
    return cartItems.some((item) => item.id === trackId);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);
  const cartCount = cartItems.length;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        totalPrice,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe utilizarse dentro de un CartProvider");
  }
  return context;
};
