import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

import { EXIT_DURATION_MS } from "./useTaskExit";

/**
 * Collapses its content to nothing while fading it out, so a task leaving a
 * list does not vanish under the cursor. The grid row unit goes from 1fr to
 * 0fr, which animates the height without having to measure it.
 */
export const TaskExit = ({
  children,
  isLeaving,
}: {
  children: ReactNode;
  isLeaving: boolean;
}) => (
  <div
    className={cn(
      "grid transition-all ease-out motion-reduce:transition-none",
      isLeaving ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100",
    )}
    style={{ transitionDuration: `${EXIT_DURATION_MS}ms` }}
  >
    <div className="overflow-hidden">{children}</div>
  </div>
);
