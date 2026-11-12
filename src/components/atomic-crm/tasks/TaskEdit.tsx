import {
  EditBase,
  Form,
  RecordRepresentation,
  useGetPathForRecord,
  useNotify,
  useTranslate,
  type Identifier,
} from "ra-core";
import { Link } from "react-router";
import { DeleteButton } from "@/components/admin/delete-button";
import { SaveButton } from "@/components/admin/form";
import { ReferenceField } from "@/components/admin/reference-field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { TaskFormContent } from "./TaskFormContent";

/** The record the enclosing reference resolved, named and linked to its page. */
const RelatedRecord = ({ label }: { label: string }) => {
  const path = useGetPathForRecord({ link: "show" });
  if (!path) return null;
  return (
    <span>
      {label}{" "}
      <Link to={path} className="font-medium text-foreground hover:underline">
        <RecordRepresentation />
      </Link>
    </span>
  );
};

/**
 * Who the meeting is with. The form cannot change the contact, so this line is
 * the only place the dialog says whose meeting it is, which matters when it is
 * opened from the calendar, away from any contact page.
 */
const TaskContactSummary = () => {
  const translate = useTranslate();
  return (
    // min-h keeps the form from jumping once the names have loaded.
    <DialogDescription className="flex min-h-5 flex-wrap justify-center gap-x-4 gap-y-1 sm:justify-start">
      <ReferenceField source="contact_id" reference="contacts" link={false}>
        <RelatedRecord label={translate("resources.tasks.fields.contact_id")} />
        <ReferenceField source="company_id" reference="companies" link={false}>
          <RelatedRecord
            label={translate("resources.contacts.fields.company_id")}
          />
        </ReferenceField>
      </ReferenceField>
    </DialogDescription>
  );
};

export const TaskEdit = ({
  open,
  close,
  taskId,
}: {
  taskId: Identifier;
  open: boolean;
  close: () => void;
}) => {
  const notify = useNotify();
  const translate = useTranslate();
  return (
    <Dialog open={open} onOpenChange={close}>
      {open && taskId && (
        <EditBase
          id={taskId}
          resource="tasks"
          className="mt-0"
          mutationOptions={{
            onSuccess: () => {
              close();
              notify("resources.tasks.updated", {
                type: "info",
                undoable: true,
              });
            },
          }}
          redirect={false}
        >
          <DialogContent className="lg:max-w-xl overflow-y-auto max-h-9/10 top-1/20 translate-y-0">
            <Form className="flex flex-col gap-4">
              <DialogHeader>
                <DialogTitle>
                  {translate("resources.tasks.action.edit")}
                </DialogTitle>
                <TaskContactSummary />
              </DialogHeader>
              <TaskFormContent />
              <DialogFooter className="w-full sm:justify-between gap-4">
                <DeleteButton
                  mutationOptions={{
                    onSuccess: () => {
                      close();
                      notify("resources.tasks.deleted", {
                        type: "info",
                        undoable: true,
                      });
                    },
                  }}
                  redirect={false}
                />
                <SaveButton label="ra.action.save" />
              </DialogFooter>
            </Form>
          </DialogContent>
        </EditBase>
      )}
    </Dialog>
  );
};
