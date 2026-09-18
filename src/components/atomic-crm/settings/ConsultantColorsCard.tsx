import { useGetList, useNotify, useTranslate, useUpdate } from "ra-core";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

import { ColorSwatchInput } from "../misc/ColorSwatchInput";
import { fallbackRdvColor } from "../misc/rdvColors";
import { salesName } from "../sales/salesName";
import type { Sale } from "../types";

const MAX_CONSULTANTS = 200;

/**
 * One row of the list: the swatch tracks the picker while it is open, and the
 * write happens on blur — `input type="color"` fires a change per pixel of
 * drag, and one mutation per pixel is not something to send to the server.
 */
const ConsultantRow = ({ consultant }: { consultant: Sale }) => {
  const [update] = useUpdate();
  const notify = useNotify();
  const name = salesName(consultant);
  const [color, setColor] = useState(
    consultant.color || fallbackRdvColor(name),
  );

  const handleCommit = () => {
    if (color === consultant.color) return;
    update(
      "sales",
      {
        id: consultant.id,
        data: { color },
        previousData: consultant,
      },
      {
        onError: () => {
          setColor(consultant.color || fallbackRdvColor(name));
          notify("crm.settings.consultant_colors.save_error", {
            type: "error",
          });
        },
      },
    );
  };

  return (
    <div className="flex items-center gap-3">
      <ColorSwatchInput
        id={`consultant-color-${consultant.id}`}
        aria-label={name}
        value={color}
        onChange={(event) => setColor(event.target.value)}
        onBlur={handleCommit}
      />
      <label
        htmlFor={`consultant-color-${consultant.id}`}
        className="text-sm cursor-pointer"
      >
        {name}
      </label>
    </div>
  );
};

/**
 * Per-consultant calendar colors, edited on their own because they live on the
 * `sales` rows rather than in the configuration record the rest of this page
 * writes — hence the immediate save instead of the page's save button.
 */
export const ConsultantColorsCard = () => {
  const translate = useTranslate();
  const { data: consultants, isPending } = useGetList<Sale>("sales", {
    filter: { disabled: false },
    pagination: { page: 1, perPage: MAX_CONSULTANTS },
    sort: { field: "id", order: "ASC" },
  });

  return (
    <Card id="consultant-colors">
      <CardContent className="space-y-4">
        <h2 className="text-xl font-semibold text-muted-foreground">
          {translate("crm.settings.consultant_colors.title")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {translate("crm.settings.consultant_colors.hint")}
        </p>
        {isPending ? null : consultants?.length ? (
          <div className="flex flex-col gap-3">
            {consultants.map((consultant) => (
              <ConsultantRow key={consultant.id} consultant={consultant} />
            ))}
          </div>
        ) : (
          <p className="text-sm">
            {translate("crm.settings.consultant_colors.empty")}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
