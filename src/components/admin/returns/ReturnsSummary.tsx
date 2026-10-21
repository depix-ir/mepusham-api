import React from "react";
import { ReturnRequest } from "@/types/return";
import { RotateCcw, RefreshCw, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { isActionRequiredByAdmin } from "@/lib/returns/stateMachine";

interface ReturnsSummaryProps {
  requests: ReturnRequest[];
}

export function ReturnsSummary({ requests }: ReturnsSummaryProps) {
  const totalCount = requests.length;
  const actionRequiredCount = requests.filter((r) => isActionRequiredByAdmin(r.status)).length;
  const completedCount = requests.filter(
    (r) => r.status === "completed" || r.status === "refunded"
  ).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
      {/* Total Card */}
      <div className="bg-background border border-border rounded-lg p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
          <span>کل درخواست‌های مرجوعی</span>
          <RotateCcw className="w-4 h-4 text-primary" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl font-bold text-foreground">
            {totalCount.toLocaleString("fa-IR")}
          </span>
          <span className="text-[11px] text-muted-foreground">درخواست</span>
        </div>
      </div>

      {/* Action Required Card */}
      <div className="bg-amber-50/50 border border-amber-200/80 rounded-lg p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-amber-800 text-xs font-medium">
          <span>نیازمند اقدام ادمین</span>
          <AlertCircle className="w-4 h-4 text-amber-600" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl font-bold text-amber-900">
            {actionRequiredCount.toLocaleString("fa-IR")}
          </span>
          <span className="text-[11px] text-amber-700">اقدام فوری</span>
        </div>
      </div>

      {/* Completed Card */}
      <div className="bg-background border border-border rounded-lg p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
          <span>تکمیل شده / بازپرداخت شده</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl font-bold text-foreground">
            {completedCount.toLocaleString("fa-IR")}
          </span>
          <span className="text-[11px] text-emerald-600 font-medium">موفق</span>
        </div>
      </div>
    </div>
  );
}
