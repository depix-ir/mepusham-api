"use client";

import React, { useId } from "react";
import { Calendar, Clock, AlertCircle } from "lucide-react";

interface PromotionDateRangeFieldProps {
  startsAt: string; // ISO string or format YYYY-MM-DDTHH:mm
  endsAt: string;
  onChangeStartsAt: (val: string) => void;
  onChangeEndsAt: (val: string) => void;
  error?: string;
}

export function PromotionDateRangeField({
  startsAt,
  endsAt,
  onChangeStartsAt,
  onChangeEndsAt,
  error,
}: PromotionDateRangeFieldProps) {
  const startId = useId();
  const endId = useId();

  // Helper to convert ISO string to HTML5 datetime-local format YYYY-MM-DDTHH:mm
  const toLocalInputValue = (isoStr: string) => {
    if (!isoStr) return "";
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
        d.getDate()
      )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return isoStr;
    }
  };

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) {
      onChangeStartsAt("");
      return;
    }
    const d = new Date(val);
    onChangeStartsAt(d.toISOString());
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) {
      onChangeEndsAt("");
      return;
    }
    const d = new Date(val);
    onChangeEndsAt(d.toISOString());
  };

  const startDate = startsAt ? new Date(startsAt) : null;
  const endDate = endsAt ? new Date(endsAt) : null;
  const invalidRange =
    startDate &&
    endDate &&
    !isNaN(startDate.getTime()) &&
    !isNaN(endDate.getTime()) &&
    endDate.getTime() <= startDate.getTime();

  return (
    <div className="flex flex-col gap-3 w-full">
      <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
        <Calendar className="w-4 h-4 text-primary shrink-0" />
        <span>زمان‌بندی اعتبار (شروع و پایان)</span>
      </span>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {/* Start Date & Time */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor={startId} className="text-xs font-medium text-foreground">
            تاریخ و ساعت شروع
          </label>
          <div className="relative">
            <input
              id={startId}
              type="datetime-local"
              value={toLocalInputValue(startsAt)}
              onChange={handleStartChange}
              className="w-full h-10 px-3 bg-background border border-border rounded-lg text-xs md:text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dir-ltr"
            />
          </div>
        </div>

        {/* End Date & Time */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor={endId} className="text-xs font-medium text-foreground">
            تاریخ و ساعت پایان
          </label>
          <div className="relative">
            <input
              id={endId}
              type="datetime-local"
              value={toLocalInputValue(endsAt)}
              onChange={handleEndChange}
              className={`w-full h-10 px-3 bg-background border rounded-lg text-xs md:text-sm text-foreground focus:outline-none focus:ring-1 dir-ltr ${
                invalidRange || error
                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                  : "border-border focus:border-primary focus:ring-primary"
              }`}
            />
          </div>
        </div>
      </div>

      {invalidRange && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>تاریخ پایان باید بعد از تاریخ شروع باشد.</span>
        </div>
      )}

      {error && !invalidRange && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
