import { useTranslate } from "ra-core";
import { useWatch } from "react-hook-form";
import { AutocompleteArrayInput } from "@/components/admin/autocomplete-array-input";
import { BooleanInput } from "@/components/admin/boolean-input";
import { DateInput } from "@/components/admin/date-input";
import { NumberInput } from "@/components/admin/number-input";
import { ReferenceArrayInput } from "@/components/admin/reference-array-input";
import { SelectInput } from "@/components/admin/select-input";

import { ChoiceInput } from "../misc/ChoiceInput";
import type { Sale } from "../types";
import { qvctWorkshopTypes } from "./trainingOptions";

const saleOptionRenderer = (choice: Sale) =>
  `${choice.first_name} ${choice.last_name}`;

/**
 * Who delivers the session. A workshop also records its format; only a training
 * asks for the BPF answers, since nothing is owed after a workshop or a talk.
 */
export const DealTrainingInputs = () => {
  const translate = useTranslate();
  const trainingType = useWatch({ name: "training_type" });

  return (
    <div className="flex flex-col gap-4 flex-1">
      <h3 className="text-base font-medium">
        {translate("resources.deals.field_categories.training")}
      </h3>

      <ReferenceArrayInput
        source="trainer_ids"
        reference="sales"
        sort={{ field: "last_name", order: "ASC" }}
        filter={{ "disabled@neq": true }}
      >
        <AutocompleteArrayInput
          label="resources.deals.fields.trainer_ids"
          optionText={saleOptionRenderer}
          helperText={false}
        />
      </ReferenceArrayInput>

      {/* Trainers without a CRM account: typing a new name adds it to the list. */}
      <ChoiceInput
        source="external_trainers"
        category="external_trainer"
        multiple
      />

      {trainingType === "workshop" ? (
        <SelectInput
          source="qvct_workshop_type"
          choices={qvctWorkshopTypes}
          helperText={false}
        />
      ) : null}

      {trainingType === "training" ? <TrainingDeliveryInputs /> : null}
    </div>
  );
};

/**
 * What a training actually delivered: to how many people, for how long, and the
 * post-session filing. These answers are what the yearly BPF (bilan pedagogique
 * et financier) is filled from, so none of them blocks saving a contract.
 */
const TrainingDeliveryInputs = () => (
  <>
    <NumberInput source="nb_trained_managers" min={0} helperText={false} />
    <NumberInput source="nb_trained_non_managers" min={0} helperText={false} />
    <TrainedPeopleTotal />

    <NumberInput
      source="hours_delivered"
      min={0}
      step={0.5}
      helperText={false}
    />

    <BooleanInput source="passport_eligible" helperText={false} />
    <BooleanInput source="qualiopi" helperText={false} />

    <PortalDataInputs />

    <NumberInput
      source="appropriation_rate"
      min={0}
      max={100}
      helperText={false}
    />
    <NumberInput
      source="satisfaction_rate"
      min={0}
      max={100}
      helperText={false}
    />
  </>
);

/**
 * Read-only sum of the two headcounts. It is derived, never stored, so the two
 * numbers stay the single source of truth.
 */
const TrainedPeopleTotal = () => {
  const translate = useTranslate();
  const [managers, nonManagers] = useWatch({
    name: ["nb_trained_managers", "nb_trained_non_managers"],
  });
  const total = (Number(managers) || 0) + (Number(nonManagers) || 0);

  return (
    <p className="text-sm text-muted-foreground">
      {translate("resources.deals.fields.nb_trained_total")}: {total}
    </p>
  );
};

/** The portal filing, plus the date it happened once it is declared done. */
const PortalDataInputs = () => {
  const portalDataSent = useWatch({ name: "portal_data_sent" });

  return (
    <>
      <BooleanInput source="portal_data_sent" helperText={false} />
      {portalDataSent ? (
        <DateInput source="portal_data_sent_at" helperText={false} />
      ) : null}
    </>
  );
};
