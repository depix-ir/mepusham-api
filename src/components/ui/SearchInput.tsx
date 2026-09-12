import React from "react";
import { Search, SearchProps } from "@/components/commerce/Search";

export interface SearchInputProps extends SearchProps {}

export function SearchInput(props: SearchInputProps) {
  return <Search {...props} />;
}
