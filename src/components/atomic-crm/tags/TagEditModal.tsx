import { useTranslate, useUpdate } from "ra-core";

import type { Tag, TagsResource } from "../types";
import { TagDialog } from "./TagDialog";

type TagEditModalProps = {
  tag: Tag;
  open: boolean;
  onClose(): void;
  onSuccess?(tag: Tag): Promise<void>;
  tagsResource?: TagsResource;
};

export function TagEditModal({
  tag,
  open,
  onClose,
  onSuccess,
  tagsResource = "tags",
}: TagEditModalProps) {
  const [update] = useUpdate<Tag>();
  const translate = useTranslate();

  const handleEditTag = async (data: Pick<Tag, "name" | "color">) => {
    await update(
      tagsResource,
      { id: tag.id, data, previousData: tag },
      {
        onSuccess: async (tag) => {
          await onSuccess?.(tag);
        },
      },
    );
  };

  return (
    <TagDialog
      open={open}
      title={translate("resources.tags.dialog.edit_title")}
      onClose={onClose}
      onSubmit={handleEditTag}
      tag={tag}
    />
  );
}
