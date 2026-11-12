import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, UserPlus } from "lucide-react";
import {
  useCreate,
  useDelete,
  useGetList,
  useNotify,
  useTranslate,
} from "ra-core";
import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { EXTERNAL_TRAINER_CATEGORY } from "../deals/externalTrainers";
import { EXTERNAL_TRAINER_PARAM } from "../sales/SalesCreate";
import type { Choice } from "../types";

const useRefreshChoices = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["choices"] });
};

const ExternalTrainerRow = ({ trainer }: { trainer: Choice }) => {
  const translate = useTranslate();
  const notify = useNotify();
  const refresh = useRefreshChoices();
  const [remove, { isPending }] = useDelete();

  return (
    <li className="flex items-center justify-between gap-3 py-2">
      <span className="text-sm truncate">{trainer.label}</span>
      <div className="flex items-center gap-1 shrink-0">
        <Button variant="outline" size="sm" asChild>
          <Link
            to={`/sales/create?${EXTERNAL_TRAINER_PARAM}=${trainer.id}`}
            aria-label={`${translate("crm.settings.external_trainers.create_account")} ${trainer.label}`}
          >
            <UserPlus className="size-4" />
            {translate("crm.settings.external_trainers.create_account")}
          </Link>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="cursor-pointer"
          disabled={isPending}
          onClick={() =>
            remove(
              "choices",
              { id: trainer.id, previousData: trainer },
              {
                onSuccess: refresh,
                onError: () =>
                  notify("crm.settings.external_trainers.save_error", {
                    type: "error",
                  }),
              },
            )
          }
          aria-label={`${translate("ra.action.delete")} ${trainer.label}`}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </li>
  );
};

/**
 * The trainers who work on contracts without a CRM account. Like document
 * types, they live in the `choices` table, so each change saves immediately.
 * "Create their account" opens the user form prefilled with the name; saving it
 * moves every contract naming them onto the new account.
 */
export const ExternalTrainersCard = () => {
  const translate = useTranslate();
  const notify = useNotify();
  const refresh = useRefreshChoices();
  const { data: trainers, isPending } = useGetList<Choice>("choices", {
    filter: { category: EXTERNAL_TRAINER_CATEGORY },
    pagination: { page: 1, perPage: 200 },
    sort: { field: "label", order: "ASC" },
  });
  const [create, { isPending: isCreating }] = useCreate();
  const [newName, setNewName] = useState("");

  const handleAdd = () => {
    const label = newName.trim();
    if (!label) return;
    create(
      "choices",
      { data: { category: EXTERNAL_TRAINER_CATEGORY, label } },
      {
        onSuccess: () => {
          setNewName("");
          refresh();
        },
        onError: () =>
          notify("crm.settings.external_trainers.save_error", {
            type: "error",
          }),
      },
    );
  };

  return (
    <Card id="external-trainers">
      <CardContent className="space-y-4">
        <h2 className="text-xl font-semibold text-muted-foreground">
          {translate("crm.settings.sections.external_trainers")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {translate("crm.settings.external_trainers.hint")}
        </p>

        {isPending ? null : trainers?.length ? (
          <ul className="divide-y">
            {trainers.map((trainer) => (
              <ExternalTrainerRow key={trainer.id} trainer={trainer} />
            ))}
          </ul>
        ) : (
          <p className="text-sm">
            {translate("crm.settings.external_trainers.empty")}
          </p>
        )}

        <div className="flex items-center gap-2">
          <Input
            value={newName}
            disabled={isCreating}
            placeholder={translate(
              "crm.settings.external_trainers.new_placeholder",
            )}
            aria-label={translate(
              "crm.settings.external_trainers.new_placeholder",
            )}
            onChange={(event) => setNewName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              // The settings page is one big form; Enter must not submit it.
              event.preventDefault();
              handleAdd();
            }}
          />
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer shrink-0"
            disabled={isCreating || !newName.trim()}
            onClick={handleAdd}
          >
            <Plus className="size-4" />
            {translate("crm.settings.external_trainers.add")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
