import React, { useState } from "react";
import Image from "next/image";
import { ReturnItem, InspectionResult, INSPECTION_RESULT_LABELS } from "@/types/return";
import { X, AlertTriangle, CheckCircle2, DollarSign, Package } from "lucide-react";
import { formatToman } from "@/lib/formatting/currency";

/* ================= EVIDENCE GALLERY MODAL ================= */

interface EvidenceModalProps {
  images: string[];
  isOpen: boolean;
  onClose: () => void;
}

export function EvidenceModal({ images, isOpen, onClose }: EvidenceModalProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (!isOpen || images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="relative bg-background border border-border rounded-lg max-w-2xl w-full p-4 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
          <h3 className="font-semibold text-sm text-foreground">
            تصاویر مدرک ارسالی مشتری ({images.length} تصویر)
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-surface-subtle"
          >
            <X className="" />
          </button>
        </div>

        {/* Main Active Image Display */}
        <div className="relative w-full h-80 bg-surface-subtle rounded-lg overflow-hidden border border-border">
          <Image
            src={images[activeIdx]}
            alt={`Evidence image ${activeIdx + 1}`}
            fill
            className="object-contain"
          />
        </div>

        {/* Thumbnails row if multiple */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIdx(idx)}
                className={`relative w-14 h-14 rounded-md overflow-hidden border-2 shrink-0 ${
                  activeIdx === idx ? "border-primary" : "border-border opacity-70"
                }`}
              >
                <Image src={img} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= REJECT REQUEST MODAL ================= */

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isSubmitting?: boolean;
}

export function RejectModal({ isOpen, onClose, onConfirm, isSubmitting }: RejectModalProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [customText, setCustomText] = useState("");

  const presetReasons = [
    "عدم تطابق با شرایط مرجوعی کالا",
    "سپری شدن مهلت قانونی مرجوعی (بیش از ۴۸ ساعت)",
    "جداسازی اتیکت یا وجود علائم واضح استفاده از کالا",
    "عدم ارسال مدارک و تصاویر درخواستی",
    "سایر موارد",
  ];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason =
      selectedReason === "سایر موارد" || !selectedReason
        ? customText.trim()
        : `${selectedReason}${customText ? ` - ${customText.trim()}` : ""}`;

    if (!finalReason) return;
    onConfirm(finalReason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-background border border-border rounded-lg max-w-md w-full p-5 space-y-4 shadow-xl">
        <div className="flex items-center gap-2.5 text-rose-600 font-bold text-base border-b border-border pb-3">
          <AlertTriangle className=" shrink-0" />
          <h3>رد درخواست مرجوعی / تعویض</h3>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          آیا از رد کردن این درخواست اطمینان دارید؟ لطفاً علت رد درخواست را مشخص فرمایید. این دلیل برای مشتری قابل مشاهده خواهد بود.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-foreground">
              انتخاب دلیل پیش‌فرض:
            </label>
            {presetReasons.map((reason, idx) => (
              <label
                key={idx}
                className="flex items-center gap-2 text-xs text-foreground cursor-pointer"
              >
                <input
                  type="radio"
                  name="rejectReason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="text-primary focus:ring-primary"
                />
                <span>{reason}</span>
              </label>
            ))}
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              توضیحات تکمیلی ادمین (الزامی):
            </label>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="توضیحات لازم جهت اطلاع مشتری..."
              rows={3}
              required={selectedReason === "سایر موارد" || !selectedReason}
              className="w-full text-xs p-2.5 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-foreground bg-surface-subtle border border-border rounded-md hover:bg-surface-muted"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (!selectedReason && !customText.trim())}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 rounded-md hover:bg-rose-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? "در حال ثبت..." : "تأیید و رد درخواست"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================= PROCESS REFUND MODAL ================= */

interface ProcessRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculatedAmount: number;
  onConfirm: (params: { amount: number; referenceId: string; note?: string }) => void;
  isSubmitting?: boolean;
}

export function ProcessRefundModal({
  isOpen,
  onClose,
  calculatedAmount,
  onConfirm,
  isSubmitting,
}: ProcessRefundModalProps) {
  const [amount, setAmount] = useState<number>(calculatedAmount);
  const [referenceId, setReferenceId] = useState("");
  const [note, setNote] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      amount: Number(amount),
      referenceId: referenceId.trim() || `REF-${Date.now()}`,
      note: note.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-background border border-border rounded-lg max-w-md w-full p-5 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 text-emerald-700 font-bold text-base border-b border-border pb-3">
          <DollarSign className=" shrink-0 text-emerald-600" />
          <h3>ثبت بازپرداخت مالی به مشتری</h3>
        </div>

        <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-md text-xs space-y-1">
          <div className="text-emerald-900 font-semibold">
            مبلغ بازپرداخت بر اساس قیمت واقعی خرید:
          </div>
          <div className="text-emerald-700 text-sm font-bold">
            {formatToman(calculatedAmount)}
          </div>
          <p className="text-[11px] text-emerald-800">
            مبلغ بر اساس قیمت خریداری شده در همان سفارش محاسبه شده است.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-medium text-foreground mb-1">
              مبلغ نهایی واریزی (تومان):
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full p-2 bg-background border border-border rounded-md font-bold focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-foreground mb-1">
              شماره پیگیری / مرجع بانک:
            </label>
            <input
              type="text"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              placeholder="مثال: 123456789"
              className="w-full p-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-foreground mb-1">
              یادداشت مالی (اختیاری):
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="توضیحات واریز به حساب..."
              className="w-full p-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 font-medium text-foreground bg-surface-subtle border border-border rounded-md hover:bg-surface-muted"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !referenceId.trim()}
              className="px-4 py-1.5 font-semibold text-white bg-emerald-600 rounded-md hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? "در حال ثبت..." : "تأیید و ثبت بازپرداخت"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================= INSPECTION PANEL MODAL ================= */

interface InspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ReturnItem[];
  onConfirm: (itemInspections: Array<{ itemId: string; result: InspectionResult; note?: string }>) => void;
  isSubmitting?: boolean;
}

export function InspectionModal({
  isOpen,
  onClose,
  items,
  onConfirm,
  isSubmitting,
}: InspectionModalProps) {
  const [results, setResults] = useState<Record<string, { result: InspectionResult; note: string }>>(() => {
    const init: Record<string, { result: InspectionResult; note: string }> = {};
    items.forEach((item) => {
      init[item.id] = {
        result: item.inspection?.result || "sellable",
        note: item.inspection?.note || "",
      };
    });
    return init;
  });

  if (!isOpen) return null;

  const handleResultChange = (itemId: string, result: InspectionResult) => {
    setResults((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], result },
    }));
  };

  const handleNoteChange = (itemId: string, note: string) => {
    setResults((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], note },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = items.map((item) => ({
      itemId: item.id,
      result: results[item.id]?.result || "sellable",
      note: results[item.id]?.note,
    }));
    onConfirm(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-background border border-border rounded-lg max-w-xl w-full p-5 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            <span>ثبت نتیجه بررسی کارشناسی کالا (انبار)</span>
          </h3>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-900 leading-relaxed">
          <strong>قانون بسیار مهم موجودی انبار:</strong> فقط کالاهایی که با وضعیت «سالم و قابل فروش مجدد» ثبت شوند به موجودی فعال انبار اضافه خواهند شد. کالاهای آسیب‌دیده یا غیرقابل فروش وارد موجودی نخواهند شد.
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {items.map((item) => (
            <div key={item.id} className="p-3 border border-border rounded-lg bg-surface-subtle/50 space-y-3">
              <div className="font-semibold text-foreground">{item.productTitle}</div>
              <div className="text-[11px] text-muted-foreground">
                {item.variantDisplay} - تعداد: {item.quantity}
              </div>

              <div className="space-y-1.5">
                <label className="block font-medium text-foreground">وضعیت سلامتی کالا:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { value: "sellable", label: "○ قابل فروش مجدد (موجودی +)", color: "text-emerald-700" },
                    { value: "needs_review", label: "○ نیازمند بررسی/تعمیر", color: "text-amber-700" },
                    { value: "damaged", label: "○ آسیب‌دیده (بدون تغییر موجودی)", color: "text-rose-700" },
                    { value: "unsellable", label: "○ مستعمل / غیرقابل فروش", color: "text-rose-800" },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-2 p-2 rounded border cursor-pointer ${
                        results[item.id]?.result === opt.value
                          ? "bg-background border-primary font-medium"
                          : "border-border hover:bg-background"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`insp-${item.id}`}
                        value={opt.value}
                        checked={results[item.id]?.result === opt.value}
                        onChange={() => handleResultChange(item.id, opt.value as InspectionResult)}
                        className="text-primary focus:ring-primary"
                      />
                      <span className={opt.color}>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">توضیحات کارشناس:</label>
                <input
                  type="text"
                  value={results[item.id]?.note || ""}
                  onChange={(e) => handleNoteChange(item.id, e.target.value)}
                  placeholder="ملاحظات فنی، سلامت پلمپ و اتیکت..."
                  className="w-full p-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          ))}

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 font-medium text-foreground bg-surface-subtle border border-border rounded-md hover:bg-surface-muted"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 font-semibold text-white bg-primary rounded-md hover:bg-primary-hover transition-colors"
            >
              {isSubmitting ? "در حال ثبت..." : "تأیید نهایی کارشناسی"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
