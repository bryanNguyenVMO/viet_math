import type { ButtonHTMLAttributes, ReactNode } from "react";

export type EquationCardProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  title: string;
  preview: ReactNode;
};

export function EquationCard({ title, preview, type = "button", ...props }: EquationCardProps) {
  return (
    <button type={type} className="vm-equation-card" {...props}>
      <span className="vm-equation-card__title">{title}</span>
      <span className="vm-equation-card__preview">{preview}</span>
    </button>
  );
}
