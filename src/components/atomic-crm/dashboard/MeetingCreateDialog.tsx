import type { Identifier, RaRecord } from "ra-core";
import {
  CreateBase,
  Form,
  useDataProvider,
  useGetIdentity,
  useNotify,
  useTranslate,
  useUpdate,
} from "ra-core";
import { SaveButton } from "@/components/admin/form";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { TaskFormContent } from "../tasks/TaskFormContent";
import type { CalendarRange } from "./useMeetingEvents";

const MINUTE_MS = 60 * 1000;

/**
 * Creation dialog opened by dragging across empty slots of the dashboard
 * calendar. Same form as anywhere else — only the date and duration come
 * prefilled from the slot the user drew.
 */
export const MeetingCreateDialog = ({
  slot,
  close,
}: {
  slot: CalendarRange;
  close: () => void;
}) => {
  const { identity } = useGetIdentity();
  const dataProvider = useDataProvider();
  const [update] = useUpdate();
  const notify = useNotify();
  const translate = useTranslate();

  // Creating a meeting counts as touching the contact, same as AddTask does.
  const handleSuccess = async (record: RaRecord) => {
    close();
    notify("resources.tasks.added");
    const contactId = record.contact_id as Identifier | undefined;
    if (contactId == null) return;
    const contact = await dataProvider.getOne("contacts", {
      id: contactId,
    });
    if (!contact.data) return;
    await update("contacts", {
      id: contact.data.id,
      data: { last_seen: new Date().toISOString() },
      previousData: contact.data,
    });
  };

  if (!identity) return null;

  return (
    <CreateBase
      resource="tasks"
      record={{
        due_date: slot.start.toISOString(),
        duration_minutes: Math.max(
          1,
          Math.round((slot.end.getTime() - slot.start.getTime()) / MINUTE_MS),
        ),
        sales_id: identity.id,
      }}
      mutationOptions={{ onSuccess: handleSuccess }}
    >
      <Dialog open onOpenChange={close}>
        <DialogContent className="lg:max-w-xl overflow-y-auto max-h-9/10 top-1/20 translate-y-0">
          <Form className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>
                {translate("resources.tasks.dialog.create")}
              </DialogTitle>
            </DialogHeader>
            <TaskFormContent selectContact />
            <DialogFooter className="w-full justify-end">
              <SaveButton />
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>
    </CreateBase>
  );
};
