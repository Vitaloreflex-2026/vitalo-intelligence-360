import { useTranslate } from "ra-core";
import { useWatch } from "react-hook-form";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";
import { RadioButtonGroupInput } from "@/components/admin/radio-button-group-input";
import { ReferenceInput } from "@/components/admin/reference-input";

import { contactOptionText } from "../misc/ContactOption";
import { DECIDER_ROLES, INFLUENCE_LEVEL_CHOICES } from "./concretizeChoices";

/**
 * Column template of the printed table. Below `md` the rows become stacked
 * cards instead: the three columns need about 600px, and a table of inputs is
 * awkward to fill in through a horizontal scroll.
 */
const ROW_CLASS =
  "md:grid md:grid-cols-[10rem_1fr_20rem] md:items-start md:gap-4";

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
  const nameLabel = translate("resources.assessments.concretize.deciders.name");
  const influenceLabel = translate(
    "resources.assessments.concretize.deciders.influence",
  );

  return (
    <div className="flex flex-col gap-4 md:gap-0">
      {/* The column headers only make sense once the rows are laid out as a
          table; stacked cards label each field inline instead. */}
      <div
        className={`hidden border-b pb-2 text-sm font-medium text-muted-foreground ${ROW_CLASS}`}
      >
        <span>
          {translate("resources.assessments.concretize.deciders.role")}
        </span>
        <span>{nameLabel}</span>
        <span>{influenceLabel}</span>
      </div>

      {DECIDER_ROLES.map((role) => {
        const roleLabel = translate(
          `resources.assessments.concretize.decider_roles.${role}`,
        );
        return (
          <div
            key={role}
            // Groups the inputs of one decision maker whether the row is laid
            // out as a table row or, below `md`, as a stacked card.
            role="group"
            aria-label={roleLabel}
            className={`flex flex-col gap-3 rounded-lg border p-3 md:rounded-none md:border-0 md:border-b md:p-0 md:py-3 ${ROW_CLASS}`}
          >
            <span className="font-medium">{roleLabel}</span>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground md:hidden">
                {nameLabel}
              </span>
              <DeciderContactInput role={role} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground md:hidden">
                {influenceLabel}
              </span>
              <RadioButtonGroupInput
                source={`decider_${role}_influence`}
                label={false}
                choices={INFLUENCE_LEVEL_CHOICES}
                row
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
