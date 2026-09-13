"use client";

import React from "react";
import { OrderTimelineItem } from "@/types/account";
import { Check } from "lucide-react";

interface OrderTimelineProps {
  timeline: OrderTimelineItem[];
  compact?: boolean;
}

export function OrderTimeline({ timeline, compact = false }: OrderTimelineProps) {
  if (!timeline || timeline.length === 0) return null;

  if (compact) {
    // Minimal horizontal progress bar for card view
    const completedCount = timeline.filter((t) => t.completed).length;
    const totalCount = timeline.length;
    const progressPercent = Math.round((completedCount / totalCount) * 100);

    const activeStep = timeline.filter((t) => t.completed).slice(-1)[0] || timeline[0];

    return (
      <div className="w-full space-y-2 py-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-foreground flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            وضعیت: <span className="font-bold text-primary">{activeStep.title}</span>
          </span>
          {activeStep.date && (
            <span className="text-muted-foreground text-[11px]">{activeStep.date}</span>
          )}
        </div>

        {/* Minimal Progress Bar */}
        <div className="w-full bg-surface-subtle h-1.5 rounded-full overflow-hidden border border-border-subtle/50">
          <div
            className="bg-primary h-full transition-all duration-500 rounded-full"
            style={{ width: `${Math.max(progressPercent, 15)}%` }}
          />
        </div>
      </div>
    );
  }

  // Full timeline view
  return (
    <div className="w-full py-2">
      <div className="relative flex items-center justify-between">
        {/* Horizontal Line connecting steps */}
        <div className="absolute top-3.5 left-4 right-4 h-0.5 bg-border-subtle -z-0" />

        {timeline.map((step, idx) => {
          const isCompleted = step.completed;
          const isCurrent =
            step.completed &&
            (idx === timeline.length - 1 || !timeline[idx + 1]?.completed);

          return (
            <div
              key={step.id || idx}
              className="relative z-10 flex flex-col items-center text-center flex-1"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors border-2 ${
                  isCompleted
                    ? "bg-primary border-primary text-primary-foreground shadow-xs"
                    : "bg-background border-border-subtle text-muted-foreground"
                } ${isCurrent ? "ring-4 ring-primary/20 scale-105" : ""}`}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                )}
              </div>

              <span
                className={`mt-2 text-[11px] sm:text-xs font-medium leading-tight ${
                  isCompleted
                    ? "text-foreground font-bold"
                    : "text-muted-foreground"
                }`}
              >
                {step.title}
              </span>

              {step.date && (
                <span className="text-[10px] text-muted-foreground mt-0.5 hidden sm:block">
                  {step.date}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
