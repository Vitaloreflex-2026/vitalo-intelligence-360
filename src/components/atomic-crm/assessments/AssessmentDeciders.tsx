import { useTranslate } from "ra-core";
import { useWatch } from "react-hook-form";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";
import { RadioButtonGroupInput } from "@/components/admin/radio-button-group-input";
import { ReferenceInput } from "@/components/admin/reference-input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { contactOptionText } from "../misc/ContactOption";
import { DECIDER_ROLES, INFLUENCE_LEVEL_CHOICES } from "./concretizeChoices";

/** The deciders are people of the client company, so they are picked among its contacts. */
const DeciderContactInput = ({ role }: { role: string }) => {
  const companyId = useWatch({ name: "company_id" });
  return (
    <ReferenceInput
      source={`decider_${role}_contact_id`}
      reference="contacts_summary"
      filter={companyId ? { company_id: companyId } : undefined}
    >
      <AutocompleteInput
        label={false}
        optionText={contactOptionText}
        helperText={false}
        clearable
        modal
      />
    </ReferenceInput>
  );
};

/**
 * Section 2 of the "Concretize" page: the project decision makers, one fixed row
 * per role with a contact and an influence level, like the printed table.
 */
export const AssessmentDeciders = () => {
  const translate = useTranslate();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-40">
            {translate("resources.assessments.concretize.deciders.role")}
          </TableHead>
          <TableHead>
            {translate("resources.assessments.concretize.deciders.name")}
          </TableHead>
          <TableHead className="w-80">
            {translate("resources.assessments.concretize.deciders.influence")}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {DECIDER_ROLES.map((role) => (
          <TableRow key={role}>
            <TableCell className="font-medium">
              {translate(
                `resources.assessments.concretize.decider_roles.${role}`,
              )}
            </TableCell>
            <TableCell>
              <DeciderContactInput role={role} />
            </TableCell>
            <TableCell>
              <RadioButtonGroupInput
                source={`decider_${role}_influence`}
                label={false}
                choices={INFLUENCE_LEVEL_CHOICES}
                row
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
