import { useGetList } from "ra-core";

import type { Assessment, Company } from "../types";

/**
 * The most recent assessment of a company, shared by the components of its show
 * page so they issue a single request.
 */
export const useCompanyLatestAssessment = (company?: Company) => {
  const { data, isPending } = useGetList<Assessment>(
    "assessments",
    {
      filter: { company_id: company?.id },
      pagination: { page: 1, perPage: 1 },
      sort: { field: "created_at", order: "DESC" },
    },
    { enabled: company?.id != null },
  );

  return { assessment: data?.[0], isPending };
};
