import React from "react";
import { Search, SearchProps } from "@/components/commerce/Search";

export type SearchInputProps = SearchProps;

export function SearchInput(props: SearchInputProps) {
  return <Search {...props} />;
}
