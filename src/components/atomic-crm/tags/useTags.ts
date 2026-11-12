import { useGetList } from "ra-core";

import type { Tag, TagsResource } from "../types";

type UseTagsOptions = {
  enabled?: boolean;
  perPage?: number;
  resource?: TagsResource;
};

export function useTags({
  enabled,
  perPage = 1000,
  resource = "tags",
}: UseTagsOptions = {}) {
  return useGetList<Tag>(
    resource,
    {
      pagination: { page: 1, perPage },
      sort: { field: "name", order: "ASC" },
    },
    { enabled },
  );
}
