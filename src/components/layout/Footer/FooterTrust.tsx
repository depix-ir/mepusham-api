import React from "react";
import { TrustBadgePlaceholder } from "./TrustBadgePlaceholder";
import { trustBadges } from "./footer.data";

export function FooterTrust() {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm md:text-base font-medium text-neutral-900 leading-none">
        اعتماد و مجوزها
      </h3>
      <div className="flex items-center gap-3">
        {trustBadges.map((badge) => (
          <TrustBadgePlaceholder key={badge.id} badge={badge} />
        ))}
      </div>
    </div>
  );
}
