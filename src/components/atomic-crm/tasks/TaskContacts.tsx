import { Fragment } from "react";
import { RecordContextProvider, useGetRecordRepresentation } from "ra-core";
import { Link } from "react-router";
import { ReferenceArrayField } from "@/components/admin/reference-array-field";

import type { Contact, Task } from "../types";

/**
 * The contacts a meeting is with, as comma-separated links to their pages.
 */
export const TaskContacts = ({
  task,
  className,
}: {
  task: Task;
  className?: string;
}) => {
  const getContactRepresentation = useGetRecordRepresentation("contacts");
  return (
    <RecordContextProvider value={task}>
      <ReferenceArrayField<Task, Contact>
        source="contact_ids"
        reference="contacts"
        render={({ data }) => (
          <span className={className}>
            {data?.map((contact, index) => (
              <Fragment key={contact.id}>
                {index > 0 && ", "}
                <Link
                  to={`/contacts/${contact.id}/show`}
                  className="hover:underline"
                >
                  {getContactRepresentation(contact)}
                </Link>
              </Fragment>
            ))}
          </span>
        )}
      />
    </RecordContextProvider>
  );
};
