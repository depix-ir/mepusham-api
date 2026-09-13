"use client";

import React, { useEffect } from "react";
import { useCart } from "@/store/cart/cart.store";
import { CartHeader } from "./CartHeader";
import { CartItem } from "./CartItem";
import { CartSummary } from "./CartSummary";
import { CartEmptyState } from "./CartEmptyState";
import { CartValidationError } from "@/store/cart/cart.types";

export function CartDrawer() {
  const {
    items,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
    getTotal,
    getItemCount,
    validateCurrentCart,
  } = useCart();

  const [validationErrors, setValidationErrors] = React.useState<CartValidationError[]>([]);
  const [shouldRender, setShouldRender] = React.useState(isCartOpen);
  const [isVisible, setIsVisible] = React.useState(false);

  // Manage entry and exit transition states
  useEffect(() => {
    if (isCartOpen) {
      setShouldRender(true);
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isCartOpen]);

  // Handle Escape Key press & Scroll Lock
  useEffect(() => {
    if (!shouldRender) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeCart();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Lock body scroll preserving layout
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [shouldRender, closeCart]);

  if (!shouldRender) return null;

  const total = getTotal();
  const itemCount = getItemCount();

  const handleCheckoutValidation = (): boolean => {
    const result = validateCurrentCart();
    if (!result.valid) {
      setValidationErrors(result.errors);
      return false;
    }
    setValidationErrors([]);
    return true;
  };

  const handleItemUpdate = (itemId: string, newQuantity: number) => {
    if (validationErrors.length > 0) setValidationErrors([]);
    updateQuantity(itemId, newQuantity);
  };

  const handleItemRemove = (itemId: string) => {
    if (validationErrors.length > 0) setValidationErrors([]);
    removeItem(itemId);
  };

  return (
    <div className="fixed inset-0 z-50 select-none">
      {/* Background Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
          isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Cart Panel Component - Physical Left positioning */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="سبد خرید"
        className={`fixed top-0 bottom-0 !left-0 !right-auto z-10 flex flex-col w-full md:w-[400px] h-[100dvh] bg-background shadow-2xl transition-transform duration-300 ease-in-out border-r border-border-subtle [direction:rtl] ${
          isVisible ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Cart Header */}
        <CartHeader itemCount={itemCount} onClose={closeCart} />

        {/* Scrollable Cart Content Area */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 flex flex-col gap-2">
          {items.length === 0 ? (
            <CartEmptyState onClose={closeCart} />
          ) : (
            items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={handleItemUpdate}
                onRemove={handleItemRemove}
                onNavigate={closeCart}
              />
            ))
          )}
        </div>

        {/* Sticky Cart Summary Footer */}
        {items.length > 0 && (
          <CartSummary
            total={total}
            itemCount={itemCount}
            validationErrors={validationErrors}
            onCheckoutValidation={handleCheckoutValidation}
            onCheckoutSuccess={closeCart}
          />
        )}
      </div>
    </div>
  );
}
