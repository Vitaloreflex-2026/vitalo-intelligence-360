import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** One titled group of rows inside the notification panel. */
export const NotificationSection = ({
  children,
  title,
  titleClassName,
}: {
  children: ReactNode;
  title: string;
  titleClassName?: string;
}) => (
  <section className="px-4 pb-2">
    <h3
      className={cn(
        "text-xs font-semibold uppercase tracking-wide pt-2 pb-1",
        titleClassName,
      )}
    >
      {title}
    </h3>
    <ul className="divide-y">{children}</ul>
  </section>
);
