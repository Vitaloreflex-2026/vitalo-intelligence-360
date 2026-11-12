import { useCallback } from "react";
import { useDataProvider } from "ra-core";

import type { Tag, TagsResource } from "../types";

export function useCreateTag(resource: TagsResource = "tags") {
  const dataProvider = useDataProvider();

  return useCallback(
    async (data: Pick<Tag, "name" | "color">) => {
      const response = await dataProvider.create<Tag>(resource, { data });
      return response.data;
    },
    [dataProvider, resource],
  );
}
