import type { ButtonHTMLAttributes, ReactNode } from "react";

export type SymbolButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  symbol: ReactNode;
  label: string;
};

export function SymbolButton({ symbol, label, type = "button", ...props }: SymbolButtonProps) {
  return (
    <button
      type={type}
      className="vm-symbol-button"
      aria-label={label}
      title={label}
      {...props}
    >
      {symbol}
    </button>
  );
}
