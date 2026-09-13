"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart/cart.store";
import { CartItem } from "@/components/cart/CartItem";
import { CartEmptyState } from "@/components/cart/CartEmptyState";
import { formatPrice } from "@/lib/formatting/currency";
import { TomanIcon } from "@/components/icons";
import { AlertCircle, ArrowLeft, Trash2, ShoppingBag } from "lucide-react";
import { CartValidationError } from "@/store/cart/cart.types";

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    getTotal,
    getItemCount,
    validateCurrentCart,
  } = useCart();

  const [validationErrors, setValidationErrors] = useState<CartValidationError[]>([]);

  const total = getTotal();
  const itemCount = getItemCount();

  const handleCheckout = () => {
    const result = validateCurrentCart();
    if (!result.valid) {
      setValidationErrors(result.errors);
      return;
    }
    setValidationErrors([]);
    router.push("/checkout");
  };

  const handleItemUpdate = (itemId: string, newQuantity: number) => {
    if (validationErrors.length > 0) setValidationErrors([]);
    updateQuantity(itemId, newQuantity);
  };

  const handleItemRemove = (itemId: string) => {
    if (validationErrors.length > 0) setValidationErrors([]);
    removeItem(itemId);
  };

  if (items.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-12">
        <div className="bg-background border border-border-subtle rounded-2xl shadow-sm p-6 sm:p-12">
          <CartEmptyState />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Page Title & Controls */}
      <div className="flex items-center justify-between pb-6 border-b border-border-subtle mb-6">
        <div className="flex items-center gap-3">
          <ShoppingBag className="w-6 h-6 text-primary" />
          <h1 className="text-xl sm:text-2xl font-black text-foreground">
            سبد خرید شما
          </h1>
          <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full">
            {itemCount} کالا
          </span>
        </div>

        <button
          type="button"
          onClick={clearCart}
          className="flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-error transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          <span>خالی کردن سبد</span>
        </button>
      </div>

      {/* Main Grid: Cart Items List (Right) + Order Summary Panel (Left) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={handleItemUpdate}
              onRemove={handleItemRemove}
            />
          ))}
        </div>

        {/* Order Summary Sticky Card */}
        <div className="lg:col-span-4 sticky top-24">
          <div className="bg-background border border-border shadow-md rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
            <h2 className="text-base font-bold text-foreground pb-3 border-b border-border-subtle">
              خلاصه سفارش
            </h2>

            {/* Validation Errors Banner */}
            {validationErrors.length > 0 && (
              <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-red-50 border border-red-200 text-error text-xs">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>خطا در تکمیل سفارش:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] font-medium pr-1 text-red-700">
                  {validationErrors.map((err, idx) => (
                    <li key={`${err.itemId}-${idx}`}>{err.message}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Price Row */}
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-muted">
                مبلغ کل کالاها
              </span>
              <div className="flex items-center gap-1 text-lg font-black text-foreground">
                <span>{formatPrice(total)}</span>
                <TomanIcon size={16} className="text-muted shrink-0" />
              </div>
            </div>

            {/* Checkout Button */}
            <button
              type="button"
              onClick={handleCheckout}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary-hover active:bg-primary-active transition-all shadow-md cursor-pointer"
            >
              <span>ادامه و پرداخت</span>
              <ArrowLeft className="w-4 h-4" />
            </button>

            {/* Back to Products */}
            <Link
              href="/products"
              className="text-center text-xs font-medium text-muted hover:text-primary transition-colors pt-2"
            >
              انصراف و بازگشت به فروشگاه
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
