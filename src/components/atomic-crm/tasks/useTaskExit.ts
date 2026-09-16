import { useState } from "react";

/** Duration of the fold-away animation played by <TaskExit>. */
export const EXIT_DURATION_MS = 300;

/**
 * Lets a task row fold away before it leaves its list: `leave` plays the
 * animation, then runs the mutation that actually removes the task. Pair it
 * with <TaskExit> around the row.
 */
export const useTaskExit = () => {
  const [isLeaving, setIsLeaving] = useState(false);

  const leave = (removeTask: () => void) => {
    setIsLeaving(true);
    setTimeout(removeTask, EXIT_DURATION_MS);
  };

  return { isLeaving, leave };
};
