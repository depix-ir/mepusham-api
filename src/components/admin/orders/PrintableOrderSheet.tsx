"use client";

import React from "react";
import { Order } from "@/types/account";
import { formatPrice } from "@/lib/formatting/currency";

interface PrintableOrderSheetProps {
  orders: Order[];
}

export function PrintableOrderSheet({ orders }: PrintableOrderSheetProps) {
  if (!orders || orders.length === 0) return null;

  return (
    <div className="hidden print:block print:bg-white print:text-black dir-rtl font-sans">
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          body * {
            visibility: hidden;
          }
          #printable-area, #printable-area * {
            visibility: visible;
          }
          #printable-area {
            position: static !important;
            width: 100%;
            margin: 0;
            padding: 0;
          }
          .order-print-sheet {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .page-break {
            page-break-after: always !important;
            break-after: page !important;
          }
        }
      `}</style>

      <div id="printable-area">
        {orders.map((order, index) => (
          <div
            key={order.id}
            className={`order-print-sheet p-6 border border-gray-300 rounded-lg max-w-3xl mx-auto mb-8 bg-white ${
              index < orders.length - 1 ? "page-break" : ""
            }`}
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
              <div>
                <h1 className="text-xl font-bold">فاکتور فروشگاه - سفارش #{order.orderNumber}</h1>
                <p className="text-xs text-gray-500 mt-1">تاریخ سفارش: {order.createdAt}</p>
              </div>
              <div className="text-left text-xs text-gray-600">
                <p>روش ارسال: {order.shippingMethod.title}</p>
                {order.shippingMethod.trackingCode && (
                  <p>کد رهگیری: {order.shippingMethod.trackingCode}</p>
                )}
              </div>
            </div>

            {/* Customer & Address */}
            <div className="bg-gray-50 p-3 rounded mb-4 text-xs space-y-1 border border-gray-200">
              <div className="flex justify-between font-bold text-gray-800">
                <span>تحویل‌گیرنده: {order.shippingAddress.recipientName}</span>
                <span>شماره تماس: {order.shippingAddress.phone}</span>
              </div>
              <p className="text-gray-600">
                آدرس: {order.shippingAddress.province}، {order.shippingAddress.city}، {order.shippingAddress.address}
              </p>
              <p className="text-gray-600">کد پستی: {order.shippingAddress.postalCode}</p>
            </div>

            {/* Order Items Table */}
            <table className="w-full text-xs text-right border-collapse mb-4">
              <thead>
                <tr className="border-b border-gray-300 bg-gray-100">
                  <th className="p-2">#</th>
                  <th className="p-2">نام محصول</th>
                  <th className="p-2">تنوع / ویژگی</th>
                  <th className="p-2 text-center">تعداد</th>
                  <th className="p-2 text-left">قیمت واحد</th>
                  <th className="p-2 text-left">مجموع</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, itemIdx) => {
                  const variantText = item.variant
                    ? Object.values(item.variant).filter(Boolean).join(" / ")
                    : "-";
                  return (
                    <tr key={item.id} className="border-b border-gray-200">
                      <td className="p-2">{itemIdx + 1}</td>
                      <td className="p-2 font-medium">{item.title}</td>
                      <td className="p-2 text-gray-600">{variantText}</td>
                      <td className="p-2 text-center">{item.quantity}</td>
                      <td className="p-2 text-left">{formatPrice(item.unitPrice)} تومان</td>
                      <td className="p-2 text-left font-semibold">
                        {formatPrice(item.quantity * item.unitPrice)} تومان
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Totals Summary */}
            <div className="flex justify-end text-xs">
              <div className="w-64 space-y-1 border-t border-gray-300 pt-2">
                <div className="flex justify-between text-gray-600">
                  <span>جمع اقلام:</span>
                  <span>{formatPrice(order.itemsSubtotal)} تومان</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>هزینه ارسال:</span>
                  <span>
                    {order.shippingCost === 0
                      ? "رایگان"
                      : `${formatPrice(order.shippingCost)} تومان`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-sm text-black pt-2 border-t border-gray-300">
                  <span>مبلغ قابل پرداخت:</span>
                  <span>{formatPrice(order.payableTotal)} تومان</span>
                </div>
              </div>
            </div>

            {/* Footer / Notes */}
            <div className="mt-8 pt-4 border-t border-dashed border-gray-300 text-[10px] text-gray-500 text-center">
              از خرید شما متشکریم! | پشتیبانی فروشگاه
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
