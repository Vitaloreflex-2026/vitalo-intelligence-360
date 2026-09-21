import { useLocaleState, useRecordContext, useTranslate } from "ra-core";
import { Link as RouterLink } from "react-router";
import { ReferenceArrayField } from "@/components/admin/reference-array-field";
import { SingleFieldList } from "@/components/admin/single-field-list";
import { TextField } from "@/components/admin/text-field";
import { Badge } from "@/components/ui/badge";

import { formatLocalizedDate } from "../misc/RelativeDate";
import { relationshipStatuses } from "../misc/relationshipStatuses";
import { sponsorRoles } from "../misc/sponsorRoles";
import type { Contact } from "../types";

/**
 * Position-related contact details: how long they have been with the company,
 * their role in the decision, their relationship status and their peers.
 */
export const ContactPositionInfo = () => {
  const record = useRecordContext<Contact>();
  const translate = useTranslate();
  const [locale = "en"] = useLocaleState();

  if (!record) return null;
  if (
    !record.company_start_date &&
    !record.decision_role &&
    !record.relationship_status &&
    !record.sponsor_role &&
    !record.linked_contact_ids?.length
  ) {
    return null;
  }

  const status = relationshipStatuses.find(
    (choice) => choice.id === record.relationship_status,
  );
  const sponsorRole = sponsorRoles.find(
    (choice) => choice.id === record.sponsor_role,
  );

  return (
    <div className="flex flex-col gap-1 text-sm">
      {record.company_start_date && (
        <span>
          {translate("resources.contacts.fields.company_start_date")}:{" "}
          {formatLocalizedDate(record.company_start_date, locale)}
        </span>
      )}
      {record.decision_role && (
        <span>
          {translate("resources.contacts.fields.decision_role")}:{" "}
          <TextField source="decision_role" />
        </span>
      )}
      {status && (
        <span>
          {translate("resources.contacts.fields.relationship_status")}:{" "}
          {translate(status.name)}
        </span>
      )}
      {sponsorRole && (
        <span>
          {translate("resources.contacts.fields.sponsor_role")}:{" "}
          {translate(sponsorRole.name)}
        </span>
      )}
      {!!record.linked_contact_ids?.length && (
        <div className="flex flex-col gap-1">
          <span>
            {translate("resources.contacts.fields.linked_contact_ids")}:
          </span>
          <ReferenceArrayField
            source="linked_contact_ids"
            reference="contacts_summary"
          >
            <SingleFieldList
              className="flex-wrap"
              render={(contact: Contact) => (
                <Badge variant="outline" asChild>
                  <RouterLink to={`/contacts/${contact.id}/show`}>
                    {contact.first_name} {contact.last_name}
                  </RouterLink>
                </Badge>
              )}
            />
          </ReferenceArrayField>
        </div>
      )}
    </div>
  );
};
