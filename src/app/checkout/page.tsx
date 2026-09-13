"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart/cart.store";
import { CustomerInformation, CheckoutFormErrors } from "@/types/checkout";
import { validateCustomerForm } from "@/lib/checkout/validation";
import { shippingMethods, DEFAULT_SHIPPING_METHOD_ID, getShippingMethodById } from "@/data/shipping";

import { CheckoutHeader } from "@/components/checkout/CheckoutHeader";
import { CustomerInformationForm } from "@/components/checkout/CustomerInformationForm";
import { ShippingMethodSelector } from "@/components/checkout/ShippingMethodSelector";
import { TrustSection } from "@/components/checkout/TrustSection";
import { CheckoutCartItems } from "@/components/checkout/CheckoutCartItems";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { MobileCheckoutBar } from "@/components/checkout/MobileCheckoutBar";
import { CartEmptyState } from "@/components/cart/CartEmptyState";

import { AlertCircle } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    updateQuantity,
    removeItem,
    getTotal,
    validateCurrentCart,
  } = useCart();

  // Session state for customer checkout form
  const [customer, setCustomer] = useState<CustomerInformation>({
    firstName: "",
    lastName: "",
    phone: "",
    province: "",
    city: "",
    address: "",
    postalCode: "",
  });

  const [selectedShippingId, setSelectedShippingId] = useState<string>(
    DEFAULT_SHIPPING_METHOD_ID
  );

  const [formErrors, setFormErrors] = useState<CheckoutFormErrors>({});
  const [cartValidationErrors, setCartValidationErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Selected Shipping Object
  const selectedShipping =
    getShippingMethodById(selectedShippingId) || shippingMethods[0];

  // Single Source of Truth Price Calculations
  const itemsSubtotal = getTotal();
  const shippingCost = selectedShipping.price;
  const payableTotal = itemsSubtotal + shippingCost;

  const handleFieldChange = (field: keyof CustomerInformation, value: string) => {
    setCustomer((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleSubmitCheckout = () => {
    if (isLoading) return; // Prevent duplicate click/submission

    // 1. Validate Cart & Inventory
    const cartResult = validateCurrentCart();
    if (!cartResult.valid) {
      setCartValidationErrors(cartResult.errors.map((e) => e.message));
      return;
    }
    setCartValidationErrors([]);

    // 2. Validate Form
    const formResult = validateCustomerForm(customer);
    if (!formResult.isValid) {
      setFormErrors(formResult.errors);
      return;
    }
    setFormErrors({});

    setIsLoading(true);

    // Prepare Checkout Payload
    const checkoutPayload = {
      customer: formResult.normalizedCustomer,
      shipping: {
        methodId: selectedShipping.id,
        price: selectedShipping.price,
        title: selectedShipping.title,
        estimatedDelivery: selectedShipping.estimatedDelivery,
      },
      items: items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
      pricing: {
        itemsSubtotal,
        shippingCost,
        payableTotal,
      },
      createdAt: new Date().toISOString(),
    };

    // Store payload in sessionStorage for payment page consumption
    try {
      sessionStorage.setItem("pending_checkout_payload", JSON.stringify(checkoutPayload));
    } catch {
      // Fallback if sessionStorage is disabled
    }

    // Simulate short network delay before navigation to /payment
    setTimeout(() => {
      router.push("/payment");
    }, 400);
  };

  // Empty Cart State Rendering
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <CheckoutHeader />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 flex items-center justify-center">
          <div className="w-full bg-background border border-border-subtle rounded-2xl p-6 sm:p-12 shadow-xs">
            <CartEmptyState />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24 lg:pb-12">
      {/* Minimal Header */}
      <CheckoutHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Main 12-Column RTL Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* RIGHT SECTION (8 Columns Desktop): Main Checkout Form Flow */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            {/* Global Errors Banner */}
            {cartValidationErrors.length > 0 && (
              <div className="flex flex-col gap-2 p-4 rounded-xl bg-red-50 border border-red-200/80 text-error text-xs sm:text-sm">
                <div className="flex items-center gap-2 font-bold text-red-800">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0 text-error" />
                  <span>خطا در بررسی سبد خرید و موجودی:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-xs text-red-700 pr-2">
                  {cartValidationErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Unified Checkout Container */}
            <div className="bg-background border border-border-subtle rounded-2xl p-5 sm:p-8 divide-y divide-border-subtle/80 space-y-8">
              {/* 01. Customer & Shipping Address Form */}
              <div className="pt-0">
                <CustomerInformationForm
                  customer={customer}
                  onChange={handleFieldChange}
                  errors={formErrors}
                />
              </div>

              {/* 02. Shipping Method Selection */}
              <div className="pt-8">
                <ShippingMethodSelector
                  methods={shippingMethods}
                  selectedMethodId={selectedShippingId}
                  onSelect={(id) => setSelectedShippingId(id)}
                />
              </div>

              {/* 03. Cart Items Review */}
              <div className="pt-8">
                <CheckoutCartItems
                  items={items}
                  onUpdateQuantity={updateQuantity}
                  onRemoveItem={removeItem}
                />
              </div>

              {/* 04. Guarantee & Trust Signals */}
              <div className="pt-8">
                <TrustSection />
              </div>
            </div>
          </div>

          {/* LEFT SECTION (4 Columns Desktop): Order Summary & Payment CTA */}
          <div className="lg:col-span-4 sticky top-20">
            <OrderSummary
              itemsSubtotal={itemsSubtotal}
              shippingOption={selectedShipping}
              payableTotal={payableTotal}
              onSubmit={handleSubmitCheckout}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>

      {/* Mobile Bottom Sticky Payment Bar */}
      <MobileCheckoutBar
        payableTotal={payableTotal}
        onSubmit={handleSubmitCheckout}
        isLoading={isLoading}
      />
    </div>
  );
}
