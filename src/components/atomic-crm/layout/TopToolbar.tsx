import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

export interface TopToolbarProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export const TopToolbar = (inProps: TopToolbarProps) => {
  const { className, children, ...props } = inProps;

  return (
    <div
      className={cn(
        // Wraps rather than overflows: on a phone a list's actions and filters
        // add up to more than one row of buttons.
        "flex flex-auto flex-wrap justify-end items-end gap-2 whitespace-nowrap",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default TopToolbar;
