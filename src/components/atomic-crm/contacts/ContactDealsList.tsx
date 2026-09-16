import { ListBase, useRecordContext, useTranslate } from "ra-core";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";

import { DealsIterator } from "../deals/DealsIterator";
import type { Contact } from "../types";

/**
 * Link to the deal creation form, pre-filling the company and linked contacts
 * inputs through react-admin's `?source=` convention. Without a company the
 * contacts input stays disabled, so we prefill nothing in that case.
 */
const getCreateDealLink = (contact: Contact) =>
  contact.company_id != null
    ? `/deals/create?source=${encodeURIComponent(
        JSON.stringify({
          company_id: contact.company_id,
          contact_ids: [contact.id],
        }),
      )}`
    : "/deals/create";

/**
 * Deals linked to a contact. Deals reference their contacts through the
 * `contact_ids` array, hence the `@cs` (contains) filter rather than a
 * ReferenceManyField.
 */
export const ContactDealsList = () => {
  const record = useRecordContext<Contact>();
  const translate = useTranslate();

  if (!record) return null;

  return (
    <ListBase
      resource="deals"
      filter={{
        "contact_ids@cs": `{${record.id}}`,
        "archived_at@is": null,
      }}
      sort={{ field: "name", order: "ASC" }}
      perPage={25}
      disableSyncWithLocation
      storeKey={false}
      empty={
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-muted-foreground mb-4">
            {translate("resources.deals.empty.title")}
          </p>
          <Button variant="outline" asChild>
            <Link to={getCreateDealLink(record)}>
              {translate("resources.deals.action.add")}
            </Link>
          </Button>
        </div>
      }
    >
      <DealsIterator />
    </ListBase>
  );
};
