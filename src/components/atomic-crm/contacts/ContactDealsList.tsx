import { ListBase, useRecordContext, useTranslate } from "ra-core";

import { DealsIterator } from "../deals/DealsIterator";
import type { Contact } from "../types";

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
          <p className="text-muted-foreground">
            {translate("resources.deals.empty.title")}
          </p>
        </div>
      }
    >
      <DealsIterator />
    </ListBase>
  );
};
