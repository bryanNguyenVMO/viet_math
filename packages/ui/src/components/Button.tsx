import type { ButtonHTMLAttributes } from "react";

import { classNames } from "./classNames";

export type ButtonVariant = "default" | "primary" | "ghost" | "danger";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({
  variant = "default",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={classNames(
        "vm-button",
        variant !== "default" && `vm-button--${variant}`,
        className,
      )}
      {...props}
    />
  );
}
