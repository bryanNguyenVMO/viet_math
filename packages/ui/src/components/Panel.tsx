import type { HTMLAttributes } from "react";

import { classNames } from "./classNames";

export function Panel({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={classNames("vm-panel", className)} {...props} />;
}
