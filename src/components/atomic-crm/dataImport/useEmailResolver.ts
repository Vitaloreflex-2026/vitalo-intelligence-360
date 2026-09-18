import { useCallback, useMemo } from "react";
import { useDataProvider, type DataProvider, type Identifier } from "ra-core";

import type { Contact, Sale } from "../types";

/** Most companies hold far fewer contacts than this; the cap only bounds the query. */
const MAX_COMPANY_CONTACTS = 500;

/**
 * Resolves the contacts of one company, keyed by lowercase email address.
 *
 * Deciders are named by email in the CSV and looked up among the contacts of
 * the assessed company, exactly like the form's decider picker, which filters
 * `contacts_summary` on `company_id`. No contact is ever created: inventing a
 * nameless one from an email address would pollute the CRM, so an email nobody
 * carries simply leaves its column empty.
 */
export function useCompanyContactResolver() {
  const dataProvider = useDataProvider();
  // Cache depends on dataProvider, so it is safe as a dependency
  const cache = useMemo(
    () => new Map<Identifier, Map<string, Identifier>>(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dataProvider],
  );

  return useCallback(
    async (companyIds: Identifier[]) => {
      await Promise.all(
        [...new Set(companyIds)]
          .filter((companyId) => !cache.has(companyId))
          .map(async (companyId) => {
            cache.set(
              companyId,
              await fetchCompanyContacts(companyId, dataProvider),
            );
          }),
      );
      return cache;
    },
    [cache, dataProvider],
  );
}

/**
 * Resolves team members by email address, for the columns pointing at `sales`:
 * who closed the file, and who owns a next step. Same rule as contacts, no
 * account is ever created.
 */
export function useSaleEmailResolver() {
  const dataProvider = useDataProvider();
  // Cache depends on dataProvider, so it is safe as a dependency
  const cache = useMemo(
    () => new Map<string, Identifier | null>(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dataProvider],
  );

  return useCallback(
    async (emails: string[]) => {
      const wanted = [...new Set(emails.map(normalizeEmail))].filter(Boolean);

      // Misses are memoized too, so a CSV naming the same unknown address on
      // every row costs a single roundtrip
      await Promise.all(
        wanted
          .filter((email) => !cache.has(email))
          .map(async (email) => {
            cache.set(email, await fetchSale(email, dataProvider));
          }),
      );

      return wanted.reduce((resolved, email) => {
        const id = cache.get(email);
        if (id != null) resolved.set(email, id);
        return resolved;
      }, new Map<string, Identifier>());
    },
    [cache, dataProvider],
  );
}

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

const fetchCompanyContacts = async (
  companyId: Identifier,
  dataProvider: DataProvider,
) => {
  const { data } = await dataProvider.getList<Contact>("contacts_summary", {
    filter: { company_id: companyId },
    pagination: { page: 1, perPage: MAX_COMPANY_CONTACTS },
    sort: { field: "id", order: "ASC" },
  });

  // A contact holds several addresses, and two contacts may share one: the
  // first in id order wins, as the oldest record.
  return data.reduce((byEmail, contact) => {
    for (const { email } of contact.email_jsonb ?? []) {
      const key = normalizeEmail(email ?? "");
      if (key && !byEmail.has(key)) byEmail.set(key, contact.id);
    }
    return byEmail;
  }, new Map<string, Identifier>());
};

/** `sales.email` is a citext column, so an exact filter already ignores case. */
const fetchSale = async (email: string, dataProvider: DataProvider) => {
  const { data } = await dataProvider.getList<Sale>("sales", {
    filter: { "email@eq": email },
    pagination: { page: 1, perPage: 1 },
    sort: { field: "id", order: "ASC" },
  });
  return data[0]?.id ?? null;
};
