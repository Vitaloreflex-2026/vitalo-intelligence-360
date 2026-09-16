import { useRecordContext, useTranslate } from "ra-core";

import { relationshipStatuses } from "./relationshipStatuses";

/**
 * Renders a fixed relationship status (prospect / client / partner) from any
 * record field holding one of those values.
 */
export const RelationshipStatusField = ({ source }: { source: string }) => {
  const record = useRecordContext();
  const translate = useTranslate();
  const status = relationshipStatuses.find(
    (choice) => choice.id === record?.[source],
  );

  if (!status) return null;

  return <span>{translate(status.name)}</span>;
};
