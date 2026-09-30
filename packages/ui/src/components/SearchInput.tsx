import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

export type SearchInputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon?: ReactNode;
};

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput({ icon, ...props }, ref) {
    return (
      <label className="vm-search-input">
        {icon}
        <input ref={ref} type="search" {...props} />
      </label>
    );
  },
);
