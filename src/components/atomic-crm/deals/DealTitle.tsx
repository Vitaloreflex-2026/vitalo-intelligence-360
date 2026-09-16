import { useGetOne, useRecordContext } from "ra-core";

import type { Company, Deal } from "../types";

/**
 * A deal has no name of its own: it is identified by its company and its
 * reference, e.g. "Acme — DOS-0001". Falls back to whichever half is known.
 */
export const dealTitle = (
  deal: Pick<Deal, "id" | "reference">,
  companyName?: string,
) => {
  const parts = [companyName, deal.reference].filter(Boolean);
  return parts.length ? parts.join(" — ") : `#${deal.id}`;
};

export const DealTitle = ({ className }: { className?: string }) => {
  const record = useRecordContext<Deal>();
  const { data: company } = useGetOne<Company>(
    "companies",
    { id: record?.company_id as string },
    { enabled: record?.company_id != null },
  );

  if (!record) return null;

  return <span className={className}>{dealTitle(record, company?.name)}</span>;
};
