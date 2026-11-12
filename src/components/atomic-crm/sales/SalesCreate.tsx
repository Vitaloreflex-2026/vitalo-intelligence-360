import { useMutation } from "@tanstack/react-query";
import {
  useDataProvider,
  useGetOne,
  useNotify,
  useRedirect,
  useTranslate,
} from "ra-core";
import type { SubmitHandler } from "react-hook-form";
import { useSearchParams } from "react-router";
import { SimpleForm } from "@/components/admin/simple-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  promoteExternalTrainer,
  splitTrainerName,
} from "../deals/externalTrainers";
import type { CrmDataProvider } from "../providers/types";
import type { Choice, SalesFormData } from "../types";
import { SalesInputs } from "./SalesInputs";

/** Query parameter naming the `external_trainer` choice the new account replaces. */
export const EXTERNAL_TRAINER_PARAM = "external_trainer";

export function SalesCreate() {
  const dataProvider = useDataProvider<CrmDataProvider>();
  const notify = useNotify();
  const translate = useTranslate();
  const redirect = useRedirect();
  const [searchParams] = useSearchParams();
  const externalTrainerId = searchParams.get(EXTERNAL_TRAINER_PARAM);
  const { data: externalTrainer, isPending: isTrainerPending } =
    useGetOne<Choice>(
      "choices",
      { id: externalTrainerId ?? "" },
      { enabled: externalTrainerId != null },
    );

  const { mutate } = useMutation({
    mutationKey: ["signup"],
    mutationFn: async (data: SalesFormData) => {
      const sale = await dataProvider.salesCreate(data);
      if (!externalTrainer) return sale;
      try {
        await promoteExternalTrainer(dataProvider, {
          label: externalTrainer.label,
          saleId: sale.id,
        });
        await dataProvider.delete("choices", {
          id: externalTrainer.id,
          previousData: externalTrainer,
        });
      } catch {
        throw new Error(
          translate("resources.sales.create.external_trainer_error", {
            name: externalTrainer.label,
          }),
        );
      }
      return sale;
    },
    onSuccess: () => {
      notify("resources.sales.create.success", {
        messageArgs: {
          _: "User created. They will soon receive an email to set their password.",
        },
      });
      redirect("/sales");
    },
    onError: (error) => {
      notify(
        error.message ||
          translate("resources.sales.create.error", {
            _: "An error occurred while creating the user.",
          }),
        {
          type: "error",
        },
      );
    },
  });
  const onSubmit: SubmitHandler<SalesFormData> = async (data) => {
    mutate(data);
  };

  // The form reads its defaults once: wait for the name it is prefilled with.
  if (externalTrainerId != null && isTrainerPending) return null;

  return (
    <div className="max-w-lg w-full mx-auto mt-8">
      <Card>
        <CardHeader>
          <CardTitle>
            {translate("resources.sales.create.title", {
              _: "Create a new user",
            })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {externalTrainer ? (
            <p className="text-sm text-muted-foreground mb-4">
              {translate("resources.sales.create.external_trainer_hint", {
                name: externalTrainer.label,
              })}
            </p>
          ) : null}
          <SimpleForm
            onSubmit={onSubmit as SubmitHandler<any>}
            defaultValues={
              externalTrainer ? splitTrainerName(externalTrainer.label) : {}
            }
          >
            <SalesInputs />
          </SimpleForm>
        </CardContent>
      </Card>
    </div>
  );
}
