import { useGetList, useNotify, useTranslate, useUpdate } from "ra-core";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

import { ColorSwatchInput } from "../misc/ColorSwatchInput";
import { fallbackRdvColor } from "../misc/rdvColors";
import type { Choice } from "../types";

const MAX_MEETING_TYPES = 200;

/**
 * One row of the list: the swatch tracks the picker while it is open, and the
 * write happens on blur — `input type="color"` fires a change per pixel of
 * drag, and one mutation per pixel is not something to send to the server.
 */
const MeetingTypeRow = ({ meetingType }: { meetingType: Choice }) => {
  const [update] = useUpdate();
  const notify = useNotify();
  const [color, setColor] = useState(
    meetingType.color || fallbackRdvColor(meetingType.label),
  );

  const handleCommit = () => {
    if (color === meetingType.color) return;
    update(
      "choices",
      {
        id: meetingType.id,
        data: { color },
        previousData: meetingType,
      },
      {
        onError: () => {
          setColor(meetingType.color || fallbackRdvColor(meetingType.label));
          notify("crm.settings.rdv_types.save_error", { type: "error" });
        },
      },
    );
  };

  return (
    <div className="flex items-center gap-3">
      <ColorSwatchInput
        id={`rdv-type-color-${meetingType.id}`}
        aria-label={meetingType.label}
        value={color}
        onChange={(event) => setColor(event.target.value)}
        onBlur={handleCommit}
      />
      <label
        htmlFor={`rdv-type-color-${meetingType.id}`}
        className="text-sm cursor-pointer"
      >
        {meetingType.label}
      </label>
    </div>
  );
};

/**
 * Meeting-type colors, edited on their own because they live in the `choices`
 * referential rather than in the configuration record the rest of this page
 * writes — hence the immediate save instead of the page's save button.
 */
export const RdvTypeColorsCard = () => {
  const translate = useTranslate();
  const { data: meetingTypes, isPending } = useGetList<Choice>("choices", {
    filter: { category: "rdv_type" },
    pagination: { page: 1, perPage: MAX_MEETING_TYPES },
    sort: { field: "id", order: "ASC" },
  });

  return (
    <Card id="rdv-types">
      <CardContent className="space-y-4">
        <h2 className="text-xl font-semibold text-muted-foreground">
          {translate("crm.settings.rdv_types.title")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {translate("crm.settings.rdv_types.hint")}
        </p>
        {isPending ? null : meetingTypes?.length ? (
          <div className="flex flex-col gap-3">
            {meetingTypes.map((meetingType) => (
              <MeetingTypeRow key={meetingType.id} meetingType={meetingType} />
            ))}
          </div>
        ) : (
          <p className="text-sm">{translate("crm.settings.rdv_types.empty")}</p>
        )}
      </CardContent>
    </Card>
  );
};
