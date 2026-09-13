import React from "react";
import Link from "next/link";
import { brandInfo } from "./footer.data";

export function FooterBrand() {
  return (
    <div className="flex flex-col gap-2 max-w-sm">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-2xl font-black text-primary tracking-tight hover:opacity-90 transition-opacity w-fit"
        aria-label={brandInfo.name}
      >
        <span>{brandInfo.name}</span>
      </Link>
      <p className="text-xs md:text-sm text-neutral-600 leading-relaxed max-w-xs">
        {brandInfo.description}
      </p>
    </div>
  );
}
