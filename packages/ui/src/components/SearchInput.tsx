import type { InputHTMLAttributes, ReactNode } from "react";

export type SearchInputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon?: ReactNode;
};

export function SearchInput({ icon, ...props }: SearchInputProps) {
  return (
    <label className="vm-search-input">
      {icon}
      <input type="search" {...props} />
    </label>
  );
}
