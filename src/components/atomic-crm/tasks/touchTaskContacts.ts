import type { DataProvider, UseUpdateMutateParams } from "ra-core";

import type { Contact, Task } from "../types";

type UpdateFn = (
  resource: string,
  params: UseUpdateMutateParams<Contact>,
) => unknown;

/** Creating a meeting counts as touching every contact it is with. */
export const touchTaskContacts = async (
  task: Pick<Task, "contact_ids">,
  dataProvider: DataProvider,
  update: UpdateFn,
): Promise<void> => {
  if (!task.contact_ids?.length) return;
  const { data: contacts } = await dataProvider.getMany<Contact>("contacts", {
    ids: task.contact_ids,
  });
  const now = new Date().toISOString();
  await Promise.all(
    contacts.map((contact) =>
      update("contacts", {
        id: contact.id,
        data: { last_seen: now },
        previousData: contact,
      }),
    ),
  );
};
