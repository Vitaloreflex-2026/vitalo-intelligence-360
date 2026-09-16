import { useTranslate } from "ra-core";
import { RadioButtonGroupInput } from "@/components/admin/radio-button-group-input";
import { TextInput } from "@/components/admin/text-input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DECIDER_ROLES, INFLUENCE_LEVEL_CHOICES } from "./concretizeChoices";

/**
 * Section 2 of the "Concretize" page: the project decision makers, one fixed row
 * per role with a name and an influence level, like the printed table.
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
              <TextInput source={`decider_${role}_name`} label={false} />
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
