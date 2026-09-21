import { useLocaleState, useTranslate } from "ra-core";
import type { ReactNode } from "react";
import { ReferenceArrayField } from "@/components/admin/reference-array-field";
import { SingleFieldList } from "@/components/admin/single-field-list";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { formatLocalizedDate } from "../misc/RelativeDate";
import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Deal, Sale } from "../types";
import {
  fundingTypes,
  qvctWorkshopTypes,
  trainingTypes,
} from "./trainingOptions";

/** Every column the three blocks below can render. */
const DELIVERY_SOURCES = [
  "trainer_ids",
  "training_type",
  "nb_trained_managers",
  "nb_trained_non_managers",
  "hours_delivered",
  "qvct_workshop_type",
  "passport_eligible",
  "qualiopi",
  "portal_data_sent",
  "portal_data_sent_at",
  "appropriation_rate",
  "satisfaction_rate",
  "funding_type",
  "quote_signed",
  "quote_signed_at",
  "agreement_signed",
  "agreement_signed_at",
  "opco_name",
  "opco_contact_name",
  "opco_contact_phone",
  "opco_contact_email",
  "opco_file_submitted",
  "opco_file_submitted_at",
  "amount_invoiced_incl_tax",
  "cost_training",
  "cost_teaching",
  "cost_subcontracting",
  "cost_travel",
  "cost_materials",
] as const;

/** True as soon as one delivery answer was filled. */
const hasDeliveryData = (record: Deal) =>
  DELIVERY_SOURCES.some((source) => {
    const value = record[source];
    return Array.isArray(value) ? value.length > 0 : value != null;
  });

/**
 * The delivery half of a contract — what was taught, who funds it and what was
 * invoiced. Every block hides itself while empty, so a contract still at the
 * opportunity stage shows nothing here.
 */
export const DealTrainingSummary = ({ record }: { record: Deal }) => {
  const translate = useTranslate();

  if (!hasDeliveryData(record)) return null;

  return (
    <div className="m-4">
      <Separator className="mb-4" />
      <h3 className="text-sm font-semibold mb-3">
        {translate("resources.deals.field_categories.delivery")}
      </h3>
      <div className="flex flex-col gap-6">
        <TrainingBlock record={record} />
        <FundingBlock record={record} />
        <InvoicingBlock record={record} />
      </div>
    </div>
  );
};

const TrainingBlock = ({ record }: { record: Deal }) => {
  const translate = useTranslate();
  const [locale = "en"] = useLocaleState();

  const total =
    (record.nb_trained_managers ?? 0) + (record.nb_trained_non_managers ?? 0);
  const hasHeadcount =
    record.nb_trained_managers != null ||
    record.nb_trained_non_managers != null;

  const entries: Entry[] = [
    optionEntry(
      "training_type",
      trainingTypes,
      record.training_type,
      translate,
    ),
    numberEntry("nb_trained_managers", record.nb_trained_managers),
    numberEntry("nb_trained_non_managers", record.nb_trained_non_managers),
    hasHeadcount ? entry("nb_trained_total", String(total)) : null,
    numberEntry("hours_delivered", record.hours_delivered),
    optionEntry(
      "qvct_workshop_type",
      qvctWorkshopTypes,
      record.qvct_workshop_type,
      translate,
    ),
    booleanEntry("passport_eligible", record.passport_eligible, translate),
    booleanEntry("qualiopi", record.qualiopi, translate),
    booleanEntry("portal_data_sent", record.portal_data_sent, translate),
    dateEntry("portal_data_sent_at", record.portal_data_sent_at, locale),
    percentEntry("appropriation_rate", record.appropriation_rate),
    percentEntry("satisfaction_rate", record.satisfaction_rate),
  ].filter(isEntry);

  const hasTrainers = !!record.trainer_ids?.length;
  if (!entries.length && !hasTrainers) return null;

  return (
    <Block title={translate("resources.deals.field_categories.training")}>
      {hasTrainers ? (
        <div className="flex flex-col">
          <FieldLabel source="trainer_ids" />
          <ReferenceArrayField source="trainer_ids" reference="sales">
            <SingleFieldList
              className="flex-wrap"
              render={(sale: Sale) => (
                <Badge variant="outline">
                  {sale.first_name} {sale.last_name}
                </Badge>
              )}
            />
          </ReferenceArrayField>
        </div>
      ) : null}
      <EntryList entries={entries} />
    </Block>
  );
};

const FundingBlock = ({ record }: { record: Deal }) => {
  const translate = useTranslate();
  const [locale = "en"] = useLocaleState();

  const entries: Entry[] = [
    optionEntry("funding_type", fundingTypes, record.funding_type, translate),
    booleanEntry("quote_signed", record.quote_signed, translate),
    dateEntry("quote_signed_at", record.quote_signed_at, locale),
    booleanEntry("agreement_signed", record.agreement_signed, translate),
    dateEntry("agreement_signed_at", record.agreement_signed_at, locale),
    textEntry("opco_name", record.opco_name),
    textEntry("opco_contact_name", record.opco_contact_name),
    textEntry("opco_contact_phone", record.opco_contact_phone),
    textEntry("opco_contact_email", record.opco_contact_email),
    booleanEntry("opco_file_submitted", record.opco_file_submitted, translate),
    dateEntry("opco_file_submitted_at", record.opco_file_submitted_at, locale),
  ].filter(isEntry);

  if (!entries.length) return null;

  return (
    <Block title={translate("resources.deals.field_categories.funding")}>
      <EntryList entries={entries} />
    </Block>
  );
};

const InvoicingBlock = ({ record }: { record: Deal }) => {
  const translate = useTranslate();
  const { currency } = useConfigurationContext();
  const money = (amount: number) =>
    amount.toLocaleString(undefined, { style: "currency", currency });

  const entries: Entry[] = [
    moneyEntry(
      "amount_invoiced_incl_tax",
      record.amount_invoiced_incl_tax,
      money,
    ),
    moneyEntry("cost_training", record.cost_training, money),
    moneyEntry("cost_teaching", record.cost_teaching, money),
    moneyEntry("cost_subcontracting", record.cost_subcontracting, money),
    moneyEntry("cost_travel", record.cost_travel, money),
    moneyEntry("cost_materials", record.cost_materials, money),
  ].filter(isEntry);

  if (!entries.length) return null;

  return (
    <Block title={translate("resources.deals.field_categories.invoicing")}>
      <EntryList entries={entries} />
    </Block>
  );
};

type Entry = { source: string; value: string };

const isEntry = (candidate: Entry | null): candidate is Entry =>
  candidate !== null;

const entry = (source: string, value: string): Entry => ({ source, value });

const textEntry = (source: string, value?: string | null) =>
  value ? entry(source, value) : null;

const numberEntry = (source: string, value?: number | null) =>
  value == null ? null : entry(source, String(value));

const percentEntry = (source: string, value?: number | null) =>
  value == null ? null : entry(source, `${value} %`);

const moneyEntry = (
  source: string,
  value: number | null | undefined,
  money: (amount: number) => string,
) => (value == null ? null : entry(source, money(value)));

const dateEntry = (
  source: string,
  value: string | null | undefined,
  locale: string,
) => (value ? entry(source, formatLocalizedDate(value, locale)) : null);

const booleanEntry = (
  source: string,
  value: boolean | null | undefined,
  translate: (key: string) => string,
) =>
  value == null
    ? null
    : entry(source, translate(value ? "ra.boolean.true" : "ra.boolean.false"));

const optionEntry = (
  source: string,
  options: { id: string; name: string }[],
  value: string | null | undefined,
  translate: (key: string) => string,
) => {
  const option = options.find((choice) => choice.id === value);
  return option ? entry(source, translate(option.name)) : null;
};

const Block = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="flex flex-col gap-2">
    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {title}
    </h4>
    {children}
  </div>
);

const EntryList = ({ entries }: { entries: Entry[] }) => {
  if (!entries.length) return null;

  return (
    <div className="flex flex-wrap gap-x-10 gap-y-4">
      {entries.map(({ source, value }) => (
        <div key={source} className="flex flex-col">
          <FieldLabel source={source} />
          <span className="text-sm">{value}</span>
        </div>
      ))}
    </div>
  );
};

const FieldLabel = ({ source }: { source: string }) => {
  const translate = useTranslate();
  return (
    <span className="text-xs text-muted-foreground tracking-wide">
      {translate(`resources.deals.fields.${source}`)}
    </span>
  );
};
