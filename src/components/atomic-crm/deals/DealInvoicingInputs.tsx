import { useTranslate } from "ra-core";
import { NumberInput } from "@/components/admin/number-input";

/** Columns of the invoicing breakdown, in the order the BPF asks for them. */
const BREAKDOWN_SOURCES = [
  "cost_training",
  "cost_teaching",
  "cost_subcontracting",
  "cost_travel",
  "cost_materials",
];

/**
 * The invoiced amount and how it splits. The breakdown is informative: it is
 * never reconciled against the global amount, because a contract can be
 * invoiced before every cost is known.
 */
export const DealInvoicingInputs = () => {
  const translate = useTranslate();

  return (
    <div className="flex flex-col gap-4 flex-1">
      <h3 className="text-base font-medium">
        {translate("resources.deals.field_categories.invoicing")}
      </h3>

      <NumberInput
        source="amount_invoiced_incl_tax"
        min={0}
        helperText={false}
      />

      <h4 className="text-sm font-medium">
        {translate("resources.deals.field_categories.invoicing_breakdown")}
      </h4>
      {BREAKDOWN_SOURCES.map((source) => (
        <NumberInput key={source} source={source} min={0} helperText={false} />
      ))}
    </div>
  );
};
