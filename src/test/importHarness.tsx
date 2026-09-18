/* eslint-disable react-refresh/only-export-components */
import { useState } from "react";
import type { DataProvider } from "ra-core";
import { render } from "vitest-browser-react";

import { createDataProvider } from "@/components/atomic-crm/providers/fakerest";
import type { Db } from "@/components/atomic-crm/providers/fakerest/dataGenerator/types";
import type {
  ImportRow,
  ProcessImportBatch,
} from "@/components/atomic-crm/dataImport/types";

import { createCrmDb, StoryWrapper } from "./StoryWrapper";

export const listAll = (dataProvider: DataProvider, resource: string) =>
  dataProvider.getList(resource, {
    filter: {},
    pagination: { page: 1, perPage: 25 },
    sort: { field: "id", order: "ASC" },
  });

/** Imports one batch on click, so a test controls when the import starts. */
const ImportHarness = ({
  rows,
  useImport,
}: {
  rows: ImportRow[];
  useImport: () => ProcessImportBatch;
}) => {
  const processBatch = useImport();
  const [status, setStatus] = useState("ready");
  return (
    <>
      <button
        onClick={() => {
          setStatus("running");
          processBatch(rows).then(
            () => setStatus("imported"),
            () => setStatus("failed"),
          );
        }}
      >
        run import
      </button>
      <span>{status}</span>
    </>
  );
};

/** Renders the harness on its own data provider, so each test owns its records. */
export const renderImport = async (
  useImport: () => ProcessImportBatch,
  rows: ImportRow[],
  db?: Partial<Db>,
) => {
  const dataProvider = createDataProvider({
    db: createCrmDb(db),
    latency: 0,
    silent: true,
  });
  const screen = await render(
    <StoryWrapper dataProvider={dataProvider}>
      <ImportHarness useImport={useImport} rows={rows} />
    </StoryWrapper>,
  );
  return { dataProvider, screen };
};

/** Runs the import rendered by `renderImport` and waits for it to settle. */
export const runImport = async (
  screen: Awaited<ReturnType<typeof renderImport>>["screen"],
) => {
  await screen.getByRole("button", { name: "run import" }).click();
  await expect.element(screen.getByText("imported")).toBeVisible();
};
