import React from "react";
import { brandInfo } from "./footer.data";

export function FooterBottom() {
  return (
    <div className="pt-4 md:pt-6 border-t border-neutral-200/80 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-right">
      <p className="text-xs text-neutral-500 font-normal leading-normal">
        {brandInfo.copyright}
      </p>
    </div>
  );
}
