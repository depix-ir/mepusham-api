import React, { Suspense } from "react";
import { ProductsClientPage } from "./ProductsClientPage";

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[400px] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ProductsClientPage />
    </Suspense>
  );
}
