import { RecordContextProvider, useListContext, useTranslate } from "ra-core";

import type { Company } from "../types";
import { CompanyCard } from "./CompanyCard";

const times = (nbChildren: number, fn: (key: number) => any) =>
  Array.from({ length: nbChildren }, (_, key) => fn(key));

/** Shared by the skeleton and the loaded grid, so the two never disagree. */
const GRID_CLASS = "w-full gap-2 grid";
const GRID_STYLE = {
  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
};

const LoadingGridList = () => (
  <div className={GRID_CLASS} style={GRID_STYLE}>
    {times(15, (key) => (
      <div className="h-[200px] bg-gray-200" key={key} />
    ))}
  </div>
);

const LoadedGridList = () => {
  const { data, error, isPending } = useListContext<Company>();
  const translate = useTranslate();

  if (isPending || error) return null;

  return (
    <div className={GRID_CLASS} style={GRID_STYLE}>
      {data.map((record) => (
        <RecordContextProvider key={record.id} value={record}>
          <CompanyCard />
        </RecordContextProvider>
      ))}

      {data.length === 0 && (
        <div className="p-2">
          {translate("resources.companies.empty.title", {
            _: "No companies found",
          })}
        </div>
      )}
    </div>
  );
};

export const ImageList = () => {
  const { isPending } = useListContext();
  return isPending ? <LoadingGridList /> : <LoadedGridList />;
};
