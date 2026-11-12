import {
  EditBase,
  Form,
  RecordContextProvider,
  RecordRepresentation,
  ResourceContextProvider,
  useGetPathForRecord,
  useNotify,
  useTranslate,
  type Identifier,
} from "ra-core";
import { Link } from "react-router";
import { DeleteButton } from "@/components/admin/delete-button";
import { SaveButton } from "@/components/admin/form";
import { ReferenceArrayField } from "@/components/admin/reference-array-field";
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
const RelatedRecord = ({
  label,
  onFollow,
}: {
  label: string;
  onFollow: () => void;
}) => {
  const path = useGetPathForRecord({ link: "show" });
  if (!path) return null;
  return (
    <span>
      {label}{" "}
      <Link
        to={path}
        onClick={onFollow}
        className="font-medium text-foreground hover:underline"
      >
        <RecordRepresentation />
      </Link>
    </span>
  );
};

/**
 * Who the meeting is with: each contact and its company, linked to their
 * pages, which matters when the dialog is opened from the calendar, away from
 * any contact page.
 *
 * Following a link closes the dialog: its host can outlive the navigation (the
 * notifications panel, the contact's own page), and the dialog would otherwise
 * stay on top of the page the link leads to.
 */
const TaskContactSummary = ({ close }: { close: () => void }) => {
  const translate = useTranslate();
  return (
    // min-h keeps the form from jumping once the names have loaded.
    <DialogDescription className="flex min-h-5 flex-col items-center gap-y-1 sm:items-start">
      <ReferenceArrayField
        source="contact_ids"
        reference="contacts"
        render={({ data }) => (
          <>
            {data?.map((contact) => (
              <ResourceContextProvider key={contact.id} value="contacts">
                <RecordContextProvider value={contact}>
                  <span className="flex flex-wrap justify-center gap-x-4 sm:justify-start">
                    <RelatedRecord
                      label={translate("resources.contacts.name", {
                        smart_count: 1,
                      })}
                      onFollow={close}
                    />
                    <ReferenceField
                      source="company_id"
                      reference="companies"
                      link={false}
                    >
                      <RelatedRecord
                        label={translate(
                          "resources.contacts.fields.company_id",
                        )}
                        onFollow={close}
                      />
                    </ReferenceField>
                  </span>
                </RecordContextProvider>
              </ResourceContextProvider>
            ))}
          </>
        )}
      />
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
                <TaskContactSummary close={close} />
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
