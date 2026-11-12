import { Edit, Plus } from "lucide-react";
import {
  useGetMany,
  useRecordContext,
  useTranslate,
  useUpdate,
  type Identifier,
} from "ra-core";
import { useCallback, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { TagChip } from "../tags/TagChip";
import { TagCreateModal } from "../tags/TagCreateModal";
import { useTags } from "../tags/useTags";
import type { Company, Contact, Tag, TagsResource } from "../types";

type TagsListEditProps = {
  /** The tagged resource; companies use a tag catalog of their own. */
  resource?: "contacts" | "companies";
};

export const TagsListEdit = ({ resource = "contacts" }: TagsListEditProps) => {
  const tagsResource: TagsResource =
    resource === "companies" ? "company_tags" : "tags";
  const record = useRecordContext<Contact | Company>();
  const [open, setOpen] = useState(false);
  const translate = useTranslate();

  const { data: allTags, isPending: isPendingAllTags } = useTags({
    perPage: 10,
    resource: tagsResource,
  });
  const { data: tags, isPending: isPendingRecordTags } = useGetMany<Tag>(
    tagsResource,
    { ids: record?.tags },
    { enabled: record && record.tags && record.tags.length > 0 },
  );
  const [update] = useUpdate();

  const unselectedTags =
    allTags &&
    record &&
    allTags.filter((tag) => !record.tags?.includes(tag.id));

  const handleTagAdd = (id: number) => {
    if (!record) {
      throw new Error("No record found");
    }
    const tags = [...(record.tags ?? []), id];
    update(resource, {
      id: record.id,
      data: { tags },
      previousData: record,
    });
  };

  const handleTagDelete = async (id: Identifier) => {
    if (!record) {
      throw new Error("No record found");
    }
    const tags = (record.tags ?? []).filter((tagId) => tagId !== id);
    await update(resource, {
      id: record.id,
      data: { tags },
      previousData: record,
    });
  };

  const openTagCreateDialog = () => {
    setOpen(true);
  };

  const handleTagCreateClose = () => {
    setOpen(false);
  };

  const handleTagCreated = useCallback(
    async (tag: Tag) => {
      if (!record) {
        throw new Error("No record found");
      }

      await update(
        resource,
        {
          id: record.id,
          data: { tags: [...(record.tags ?? []), tag.id] },
          previousData: record,
        },
        {
          onSuccess: () => {
            setOpen(false);
          },
        },
      );
    },
    [update, record, resource],
  );

  if (isPendingRecordTags || isPendingAllTags) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {tags?.map((tag) => (
        <div key={tag.id}>
          <TagChip
            tag={tag}
            tagsResource={tagsResource}
            onUnlink={() => handleTagDelete(tag.id)}
          />
        </div>
      ))}

      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 md:h-6 cursor-pointer"
            >
              <Plus className="w-4 h-4 md:w-3 md:h-3 mr-1" />
              {translate("resources.tags.action.add")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {unselectedTags?.map((tag) => (
              <DropdownMenuItem
                key={tag.id}
                onClick={() => handleTagAdd(tag.id)}
              >
                <Badge
                  variant="secondary"
                  className="text-sm md:text-xs font-normal text-black"
                  style={{
                    backgroundColor: tag.color,
                  }}
                >
                  {tag.name}
                </Badge>
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem onClick={openTagCreateDialog}>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start p-0 cursor-pointer text-base md:text-sm"
              >
                <Edit className="w-4 h-4 md:w-3 md:h-3 mr-2" />
                {translate("resources.tags.action.create")}
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <TagCreateModal
        tagsResource={tagsResource}
        open={open}
        onClose={handleTagCreateClose}
        onSuccess={handleTagCreated}
      />
    </div>
  );
};
