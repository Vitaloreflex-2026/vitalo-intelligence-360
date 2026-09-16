import { useListContext } from "ra-core";

import { Task } from "./Task";
import { isDone } from "./tasksPredicate";

export const TasksIterator = ({
  showContact,
  className,
  showDone,
}: {
  showContact?: boolean;
  className?: string;
  /** Keep the done tasks, listed after the pending ones. */
  showDone?: boolean;
}) => {
  const { data, error, isPending } = useListContext();
  if (isPending || error || data.length === 0) return null;

  // A checked task leaves the list straight away, unless the caller wants the
  // whole history — it then sinks to the bottom.
  const pendingTasks = data.filter((task) => !isDone(task));
  const tasks = showDone
    ? [...pendingTasks, ...data.filter(isDone)]
    : pendingTasks;

  return (
    <div className={`space-y-4 md:space-y-2 ${className || ""}`}>
      {tasks.map((task) => (
        <Task
          task={task}
          showContact={showContact}
          animateExit={!showDone}
          key={task.id}
        />
      ))}
    </div>
  );
};
