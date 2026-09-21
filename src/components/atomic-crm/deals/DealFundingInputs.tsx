import { email, useTranslate } from "ra-core";
import { useWatch } from "react-hook-form";
import { BooleanInput } from "@/components/admin/boolean-input";
import { DateInput } from "@/components/admin/date-input";
import { SelectInput } from "@/components/admin/select-input";
import { TextInput } from "@/components/admin/text-input";

import { ChoiceInput } from "../misc/ChoiceInput";
import { fundingTypes } from "./trainingOptions";

/**
 * Who funds the training and which paperwork is signed. Nothing here blocks
 * saving: some contracts never need an agreement, and a quote is often signed
 * after the contract is opened.
 */
export const DealFundingInputs = () => {
  const translate = useTranslate();
  const fundingType = useWatch({ name: "funding_type" });

  return (
    <div className="flex flex-col gap-4 flex-1">
      <h3 className="text-base font-medium">
        {translate("resources.deals.field_categories.funding")}
      </h3>

      <SelectInput
        source="funding_type"
        choices={fundingTypes}
        helperText={false}
      />

      <SignedWithDateInputs
        source="quote_signed"
        dateSource="quote_signed_at"
      />
      <SignedWithDateInputs
        source="agreement_signed"
        dateSource="agreement_signed_at"
      />

      {fundingType === "opco" ? <DealOpcoInputs /> : null}
    </div>
  );
};

/** A "signed?" switch that reveals the signature date once it is turned on. */
const SignedWithDateInputs = ({
  source,
  dateSource,
}: {
  source: string;
  dateSource: string;
}) => {
  const signed = useWatch({ name: source });

  return (
    <>
      <BooleanInput source={source} helperText={false} />
      {signed ? <DateInput source={dateSource} helperText={false} /> : null}
    </>
  );
};

/**
 * OPCO details, only asked when the OPCO funds the training. The OPCO list is
 * user-extensible: an unknown name typed here is added to the shared list.
 */
const DealOpcoInputs = () => {
  const translate = useTranslate();
  const fileSubmitted = useWatch({ name: "opco_file_submitted" });

  return (
    <div className="flex flex-col gap-4 border-l-2 pl-4">
      <h4 className="text-sm font-medium">
        {translate("resources.deals.field_categories.opco")}
      </h4>

      <ChoiceInput source="opco_name" category="opco" />
      <TextInput source="opco_contact_name" helperText={false} />
      <TextInput source="opco_contact_phone" helperText={false} />
      <TextInput
        source="opco_contact_email"
        helperText={false}
        validate={email()}
      />

      <BooleanInput source="opco_file_submitted" helperText={false} />
      {fileSubmitted ? (
        <DateInput source="opco_file_submitted_at" helperText={false} />
      ) : null}
    </div>
  );
};
