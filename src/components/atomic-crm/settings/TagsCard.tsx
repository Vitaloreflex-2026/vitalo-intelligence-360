import { Trash2 } from "lucide-react";
import { useDelete, useGetList, useNotify, useTranslate } from "ra-core";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { useTags } from "../tags/useTags";
import type { Tag, TagsResource } from "../types";

type TagsCardProps = {
  tagsResource: TagsResource;
  /** The resource whose records carry these tags. */
  usedBy: "contacts" | "companies";
};

const TagRow = ({
  tag,
  tagsResource,
  usedBy,
}: { tag: Tag } & TagsCardProps) => {
  const translate = useTranslate();
  const notify = useNotify();
  const [remove, { isPending: isRemoving }] = useDelete();
  // Only the total matters, hence the one-record page.
  // ponytail: one count request per tag; move to a tag usage view if the list
  // grows past a few dozen tags.
  const { total } = useGetList(usedBy, {
    filter: { "tags@cs": `{${tag.id}}` },
    pagination: { page: 1, perPage: 1 },
  });

  return (
    <li className="flex items-center justify-between gap-3 py-2">
      <span
        className="text-black text-xs px-2 py-1 rounded-md truncate"
        style={{ backgroundColor: tag.color }}
      >
        {tag.name}
      </span>
      <div className="flex items-center gap-3 shrink-0">
        {total != null && (
          <span className="text-sm text-muted-foreground">
            {translate(
              total
                ? `crm.settings.${tagsResource}.usage`
                : `crm.settings.${tagsResource}.unused`,
              { smart_count: total },
            )}
          </span>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="cursor-pointer"
          // Stays disabled until the count is known: never delete on a guess.
          disabled={total !== 0 || isRemoving}
          onClick={() =>
            remove(
              tagsResource,
              { id: tag.id, previousData: tag },
              {
                onError: () =>
                  notify(`crm.settings.${tagsResource}.delete_error`, {
                    type: "error",
                  }),
              },
            )
          }
          aria-label={`${translate("ra.action.delete")} ${tag.name}`}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </li>
  );
};

/**
 * Tags are created from the contact (or company) pages; this card is where the ones nobody
 * uses anymore get removed. Like the other standalone cards of this page, it
 * saves on its own rather than through the page's save button.
 */
export const TagsCard = ({ tagsResource, usedBy }: TagsCardProps) => {
  const translate = useTranslate();
  const { data: tags, isPending } = useTags({ resource: tagsResource });

  return (
    <Card id={tagsResource}>
      <CardContent className="space-y-4">
        <h2 className="text-xl font-semibold text-muted-foreground">
          {translate(`resources.${tagsResource}.name`, { smart_count: 2 })}
        </h2>
        <p className="text-sm text-muted-foreground">
          {translate(`crm.settings.${tagsResource}.hint`)}
        </p>
        {isPending ? null : tags?.length ? (
          <ul className="divide-y">
            {tags.map((tag) => (
              <TagRow
                key={tag.id}
                tag={tag}
                tagsResource={tagsResource}
                usedBy={usedBy}
              />
            ))}
          </ul>
        ) : (
          <p className="text-sm">
            {translate(`crm.settings.${tagsResource}.empty`)}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
