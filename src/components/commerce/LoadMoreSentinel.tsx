"use client";

import React, { useEffect, useRef } from "react";

export interface LoadMoreSentinelProps {
  onIntersect: () => void;
  disabled?: boolean;
  rootMargin?: string;
  threshold?: number;
}

export function LoadMoreSentinel({
  onIntersect,
  disabled = false,
  rootMargin = "200px",
  threshold = 0.1,
}: LoadMoreSentinelProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const onIntersectRef = useRef(onIntersect);

  // Always keep callback ref current without re-subscribing observer
  useEffect(() => {
    onIntersectRef.current = onIntersect;
  }, [onIntersect]);

  useEffect(() => {
    if (disabled) return;

    const targetNode = sentinelRef.current;
    if (!targetNode) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          onIntersectRef.current();
        }
      },
      {
        root: null,
        rootMargin,
        threshold,
      }
    );

    observer.observe(targetNode);

    return () => {
      observer.disconnect();
    };
  }, [disabled, rootMargin, threshold]);

  return (
    <div
      ref={sentinelRef}
      aria-hidden="true"
      className="w-full h-8 pointer-events-none opacity-0 select-none"
    />
  );
}
