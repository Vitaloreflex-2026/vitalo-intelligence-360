import { useEffect, useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { TextInput } from "@/components/admin/text-input";

import { OTHER_CHOICE_ID } from "./diagnosticChoices";

/**
 * The free-text field that goes with the "Other" box of a checkbox group: it only
 * accepts input while that box is ticked, and empties itself when it is unticked.
 */
export const AssessmentOtherInput = ({
  source,
  group,
  option = OTHER_CHOICE_ID,
}: {
  /** The text column holding the free-text detail, e.g. `priority_issues_other`. */
  source: string;
  /** The array column holding the checkbox group, e.g. `priority_issues`. */
  group: string;
  /** The option that unlocks the field, when it is not the usual "Other" one. */
  option?: string;
}) => {
  const selected = useWatch({ name: group });
  const isOtherSelected = Array.isArray(selected) && selected.includes(option);
  const { setValue } = useFormContext();
  const wasOtherSelected = useRef(isOtherSelected);

  useEffect(() => {
    // Only clear when the user unticks the box, never on a record that was
    // loaded with inconsistent data, which would silently dirty the form.
    if (wasOtherSelected.current && !isOtherSelected) {
      setValue(source, "", { shouldDirty: true });
    }
    wasOtherSelected.current = isOtherSelected;
  }, [isOtherSelected, setValue, source]);

  return <TextInput source={source} disabled={!isOtherSelected} />;
};
