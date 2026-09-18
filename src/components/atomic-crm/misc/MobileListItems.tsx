import { RotateCcw } from "lucide-react";
import {
  type RaRecord,
  RecordContextProvider,
  useListContext,
  useTimeout,
  useTranslate,
} from "ra-core";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_ROWS = 5;

/**
 * The body of a mobile list: one row per record, plus the three states a phone
 * list has to handle on its own — a skeleton while loading, a retry when the
 * request failed (the mobile query client is offline-first, so this happens),
 * and an empty message. Only the row markup differs between resources, so it is
 * the caller's to provide.
 */
export const MobileListItems = <RecordType extends RaRecord>({
  renderItem,
  emptyText,
  errorText,
}: {
  renderItem: (record: RecordType) => ReactNode;
  /** Translation key shown when the list came back empty. */
  emptyText: string;
  /** Translation key shown above the retry button. */
  errorText: string;
}) => {
  const translate = useTranslate();
  const { data, error, isPending, refetch } = useListContext<RecordType>();
  // Nothing is drawn for a fast response, so the skeleton never flashes.
  const oneSecondHasPassed = useTimeout(1000);

  if (isPending) {
    if (!oneSecondHasPassed) return null;
    return (
      <>
        {[...Array(SKELETON_ROWS)].map((_, index) => (
          <div key={index} className="flex flex-row items-center gap-4 py-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex-1 min-w-0">
              <Skeleton className="mb-2 h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        ))}
      </>
    );
  }

  if (error && !data) {
    return (
      <div className="p-4">
        <div className="mb-4 text-center text-muted-foreground">
          {translate(errorText)}
        </div>
        <div className="mt-2 text-center">
          <Button onClick={() => refetch()}>
            <RotateCcw />
            {translate("crm.common.retry")}
          </Button>
        </div>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="p-4">
        <div className="text-muted-foreground">{translate(emptyText)}</div>
      </div>
    );
  }

  return (
    <div>
      {data.map((record) => (
        <RecordContextProvider key={record.id} value={record}>
          {renderItem(record)}
        </RecordContextProvider>
      ))}
    </div>
  );
};
