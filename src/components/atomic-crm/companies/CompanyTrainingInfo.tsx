import { useLocaleState, useTranslate } from "ra-core";
import { Check, X } from "lucide-react";

import { AsideSection } from "../misc/AsideSection";
import { formatLocalizedDate } from "../misc/RelativeDate";
import type { Company } from "../types";

/**
 * "Formations" panel of the company page: how many trainings were delivered,
 * when, and where the quote and the invoice stand. Hidden until at least one
 * of the four answers is filled.
 */
export const CompanyTrainingInfo = ({ record }: { record: Company }) => {
  const translate = useTranslate();
  const [locale = "en"] = useLocaleState();

  if (
    record.nb_trainings_delivered == null &&
    !record.training_date &&
    record.quote_approved == null &&
    record.service_invoiced == null
  ) {
    return null;
  }

  return (
    <AsideSection
      title={translate("resources.companies.field_categories.training")}
    >
      {record.nb_trainings_delivered != null && (
        <span>
          {translate("resources.companies.fields.nb_trainings_delivered")}:{" "}
          {record.nb_trainings_delivered}
        </span>
      )}
      {record.training_date && (
        <span>
          {translate("resources.companies.fields.training_date")}:{" "}
          {formatLocalizedDate(record.training_date, locale)}
        </span>
      )}
      <YesNoLine
        label={translate("resources.companies.fields.quote_approved")}
        value={record.quote_approved}
      />
      <YesNoLine
        label={translate("resources.companies.fields.service_invoiced")}
        value={record.service_invoiced}
      />
    </AsideSection>
  );
};

/** A yes/no answer, skipped entirely while nobody has answered it. */
const YesNoLine = ({
  label,
  value,
}: {
  label: string;
  value?: boolean | null;
}) => {
  if (value == null) return null;

  return (
    <span className="flex items-center gap-1">
      {label}:{" "}
      {value ? (
        <Check className="w-4 h-4 text-green-600" aria-hidden />
      ) : (
        <X className="w-4 h-4 text-muted-foreground" aria-hidden />
      )}
    </span>
  );
};
