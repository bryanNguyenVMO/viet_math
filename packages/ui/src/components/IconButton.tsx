import type { ButtonHTMLAttributes, ReactNode } from "react";

import { classNames } from "./classNames";

export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  "aria-label": string;
  icon: ReactNode;
};

export function IconButton({ icon, className, type = "button", ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      className={classNames("vm-icon-button", className)}
      {...props}
    >
      {icon}
    </button>
  );
}
