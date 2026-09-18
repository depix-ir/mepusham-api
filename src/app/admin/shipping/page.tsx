"use client";

import React, { useState, useEffect } from "react";
import { ShippingOption } from "@/data/shipping";
import { shippingService } from "@/lib/shipping/shippingService";
import { formatPrice } from "@/lib/formatting/currency";
import { useToast } from "@/components/ui/Toast";
import { TomanIcon } from "@/components/icons";
import { Truck, Plus, Edit2, Trash2, ShieldCheck } from "lucide-react";

export default function AdminShippingPage() {
  const { showToast } = useToast();
  const [methods, setMethods] = useState<ShippingOption[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<ShippingOption | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    estimatedDelivery: "",
  });

  useEffect(() => {
    setMethods(shippingService.getShippingMethods());
  }, []);

  const handleOpenAdd = () => {
    setEditingMethod(null);
    setFormData({
      title: "",
      description: "",
      price: 0,
      estimatedDelivery: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (method: ShippingOption) => {
    setEditingMethod(method);
    setFormData({
      title: method.title,
      description: method.description,
      price: method.price,
      estimatedDelivery: method.estimatedDelivery,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast("عنوان روش ارسال الزامی است.", "error");
      return;
    }

    const updated = shippingService.saveShippingMethod({
      id: editingMethod?.id,
      title: formData.title.trim(),
      description: formData.description.trim(),
      price: Number(formData.price) || 0,
      estimatedDelivery: formData.estimatedDelivery.trim(),
    });

    setMethods(updated);
    setIsModalOpen(false);
    showToast("روش ارسال با موفقیت ذخیره شد.", "success");
  };

  const handleDelete = (id: string) => {
    if (confirm("آیا از حذف این روش ارسال اطمینان دارید؟")) {
      const updated = shippingService.deleteShippingMethod(id);
      setMethods(updated);
      showToast("روش ارسال حذف گردید.", "info");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-black text-foreground flex items-center gap-2">
            <Truck className="w-6 h-6 text-primary" />
            <span>مدیریت روش‌های ارسال</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            پیکربندی هزینه‌ها، حامل‌ها و زمان تحویل مرسولات فروشگاه
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن روش ارسال</span>
        </button>
      </div>

      {/* Methods List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {methods.map((method) => (
          <div
            key={method.id}
            className="p-5 bg-background border border-border-subtle rounded-2xl flex flex-col justify-between gap-4 shadow-xs"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-foreground">{method.title}</span>
                <div className="flex items-center gap-1 font-black text-primary text-sm">
                  <span>{formatPrice(method.price)}</span>
                  <TomanIcon size={14} className="text-primary/70 shrink-0" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{method.description}</p>
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg w-fit font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>زمان تحویل: {method.estimatedDelivery}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
              <button
                type="button"
                onClick={() => handleOpenEdit(method)}
                className="p-2 text-muted-foreground hover:text-primary rounded-lg hover:bg-surface-subtle transition-colors cursor-pointer"
                title="ویرایش"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(method.id)}
                className="p-2 text-muted-foreground hover:text-error rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                title="حذف"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background border border-border-subtle rounded-2xl w-full max-w-md p-6 space-y-4 shadow-lg dir-rtl">
            <h3 className="font-bold text-base text-foreground">
              {editingMethod ? "ویرایش روش ارسال" : "افزودن روش ارسال جدید"}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted-foreground mb-1 font-medium">عنوان روش ارسال</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثلاً: ارسال اکسپرس پست"
                  className="w-full h-10 px-3 border border-border-subtle rounded-xl bg-background text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-medium">توضیحات کوتاه</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="مثلاً: تحویل سریع درب منزل"
                  className="w-full h-10 px-3 border border-border-subtle rounded-xl bg-background text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-medium">هزینه ارسال (تومان)</label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full h-10 px-3 border border-border-subtle rounded-xl bg-background text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-medium">زمان تقریبی تحویل</label>
                <input
                  type="text"
                  value={formData.estimatedDelivery}
                  onChange={(e) => setFormData({ ...formData, estimatedDelivery: e.target.value })}
                  placeholder="مثلاً: ۲ تا ۴ روز کاری"
                  className="w-full h-10 px-3 border border-border-subtle rounded-xl bg-background text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-border-subtle rounded-xl font-bold hover:bg-surface-subtle cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 cursor-pointer"
                >
                  ذخیره
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
