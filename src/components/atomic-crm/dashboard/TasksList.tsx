import { CheckSquare } from "lucide-react";
import { useTranslate } from "ra-core";
import { Card } from "@/components/ui/card";

import { AddTask } from "../tasks/AddTask";
import { TasksListContent } from "../tasks/TasksListContent";

export const TasksList = () => {
  const translate = useTranslate();
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center">
        <div className="mr-3 flex rounded-full bg-vitalo-green p-2 shadow-sm">
          <CheckSquare className="text-vitalo-ink w-5 h-5" />
        </div>
        <h2 className="font-heading text-xl font-bold text-vitalo-forest flex-1">
          {translate("crm.dashboard.upcoming_tasks", {
            _: "Upcoming Tasks",
          })}
        </h2>
        <AddTask display="icon" selectContact />
      </div>
      <Card className="p-4 mb-2 border-t-4 border-t-vitalo-green shadow-md">
        <TasksListContent hideDueLater />
      </Card>
    </div>
  );
};
