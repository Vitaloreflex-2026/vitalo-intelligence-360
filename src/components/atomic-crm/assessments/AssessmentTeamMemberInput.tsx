import { ReferenceInput } from "@/components/admin/reference-input";
import { SelectInput } from "@/components/admin/select-input";

import type { Sale } from "../types";

const saleOptionRenderer = (choice: Sale) =>
  `${choice.first_name} ${choice.last_name}`;

// A select always hands back a string. Inside a jsonb column there is no column
// type to coerce it, so the id is converted here to stay a number everywhere.
const parseSaleId = (value: string) =>
  value === "" || value == null ? null : Number(value);

/**
 * Picks someone from the team, the same way meetings pick their owner:
 * disabled accounts are filtered out and the list is sorted by last name.
 */
export const AssessmentTeamMemberInput = ({ source }: { source: string }) => (
  <ReferenceInput
    source={source}
    reference="sales"
    filter={{ "disabled@neq": true }}
    sort={{ field: "last_name", order: "ASC" }}
  >
    <SelectInput
      label={`resources.assessments.fields.${source}`}
      optionText={saleOptionRenderer}
      parse={parseSaleId}
      helperText={false}
    />
  </ReferenceInput>
);
