"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Product } from "@/types/product";
import { products } from "@/data/products";
import { getVariantDetails, findVariant } from "@/lib/product/domain";
import { CartItem, CartValidationResult, SelectedVariantAttribute } from "./cart.types";
import { validateCart } from "./cart.validation";
import { loadCartFromStorage, saveCartToStorage } from "./cart.persistence";

export interface CartContextType {
  items: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (
    product: Product,
    quantity?: number,
    selectedOptions?: Record<string, string>
  ) => boolean;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  validationResult: CartValidationResult;
  validateCurrentCart: () => CartValidationResult;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      return loadCartFromStorage();
    }
    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const isInitialMount = useRef(true);

  // 1. Persist to storage whenever items change after initial render
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    saveCartToStorage(items);
  }, [items]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), []);

  const addItem = useCallback(
    (
      product: Product,
      quantity: number = 1,
      selectedOptions: Record<string, string> = {}
    ): boolean => {
      if (!product || !product.id) return false;

      const variantDetails = getVariantDetails(product, selectedOptions);

      // Require all options to be selected if product has options
      if (product.options.length > 0 && !variantDetails.allOptionsSelected) {
        return false;
      }

      if (!variantDetails.isAvailable || variantDetails.stock <= 0) {
        return false;
      }

      const availableStock = variantDetails.stock;
      const requestedQuantity = Math.max(1, quantity);

      // Compute selected variant attributes for presentation
      const selectedVariantAttributes: SelectedVariantAttribute[] = product.options
        .map((opt) => {
          const valId = selectedOptions[opt.id];
          const valObj = opt.values.find((v) => v.id === valId);
          if (!valObj) return null;
          return {
            attributeId: opt.id,
            attributeName: opt.name,
            valueId: valObj.id,
            valueLabel: valObj.label,
          };
        })
        .filter((v): v is SelectedVariantAttribute => v !== null);

      // Variant identity logic:
      // If variantId exists, use it. Otherwise, create composite key from selected options or product ID.
      const matchedVariant = variantDetails.selectedVariant;
      const variantId = matchedVariant?.id;

      let compositeItemId = product.id;
      if (variantId) {
        compositeItemId = `${product.id}:${variantId}`;
      } else if (selectedVariantAttributes.length > 0) {
        const optionString = selectedVariantAttributes
          .map((sv) => `${sv.attributeId}=${sv.valueId}`)
          .sort()
          .join("&");
        compositeItemId = `${product.id}:${optionString}`;
      }

      const mainImage = product.images.length > 0 ? product.images[0].url : "";

      setItems((prevItems) => {
        const existingIndex = prevItems.findIndex((item) => item.id === compositeItemId);

        if (existingIndex > -1) {
          const existingItem = prevItems[existingIndex];
          const newQuantity = Math.min(existingItem.quantity + requestedQuantity, availableStock);

          const updatedItems = [...prevItems];
          updatedItems[existingIndex] = {
            ...existingItem,
            quantity: newQuantity,
            availableStock: availableStock,
            unitPrice: variantDetails.price,
            compareAtPrice: variantDetails.compareAtPrice,
          };
          return updatedItems;
        }

        const newItem: CartItem = {
          id: compositeItemId,
          productId: product.id,
          productSlug: product.slug,
          name: product.title,
          image: mainImage,
          variantId,
          selectedVariants: selectedVariantAttributes.length > 0 ? selectedVariantAttributes : undefined,
          unitPrice: variantDetails.price,
          compareAtPrice: variantDetails.compareAtPrice,
          quantity: Math.min(requestedQuantity, availableStock),
          availableStock,
        };

        return [...prevItems, newItem];
      });

      return true;
    },
    []
  );

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, targetQuantity: number) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === itemId);
      if (!existingItem) return prevItems;

      if (targetQuantity < 1) return prevItems; // Strictly enforce minimum quantity = 1

      // Validate max stock bounds
      const catalogProduct = products.find((p) => p.id === existingItem.productId);
      let maxStock = existingItem.availableStock;

      if (catalogProduct) {
        if (existingItem.variantId) {
          const v = catalogProduct.variants.find((variant) => variant.id === existingItem.variantId);
          if (v) maxStock = v.inventory.stock;
        } else if (existingItem.selectedVariants) {
          const selectedMap: Record<string, string> = {};
          existingItem.selectedVariants.forEach((sv) => {
            selectedMap[sv.attributeId] = sv.valueId;
          });
          const v = findVariant(catalogProduct, selectedMap);
          if (v) maxStock = v.inventory.stock;
        } else {
          maxStock = catalogProduct.inventory.totalStock;
        }
      }

      const safeQuantity = Math.min(targetQuantity, Math.max(1, maxStock));

      return prevItems.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            quantity: safeQuantity,
            availableStock: maxStock,
          };
        }
        return item;
      });
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getTotal = useCallback(() => {
    return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }, [items]);

  const getItemCount = useCallback(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const validationResult = useMemo(() => {
    return validateCart(items);
  }, [items]);

  const validateCurrentCart = useCallback(() => {
    return validateCart(items);
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      isCartOpen,
      openCart,
      closeCart,
      toggleCart,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getTotal,
      getItemCount,
      validationResult,
      validateCurrentCart,
    }),
    [
      items,
      isCartOpen,
      openCart,
      closeCart,
      toggleCart,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getTotal,
      getItemCount,
      validationResult,
      validateCurrentCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
