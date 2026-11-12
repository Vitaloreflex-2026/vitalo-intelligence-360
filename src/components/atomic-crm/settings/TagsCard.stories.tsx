import type { Meta } from "@storybook/react-vite";
import { buildCompany, buildContact, StoryWrapper } from "@/test/StoryWrapper";
import type { Db } from "../providers/fakerest/dataGenerator/types";
import { TagsCard } from "./TagsCard";

const meta = {
  title: "Atomic CRM/Settings/TagsCard",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;

const defaultData: Partial<Db> = {
  tags: [
    { id: 1, name: "Customer", color: "#eddcd2" },
    { id: 2, name: "Trade show 2025", color: "#c5dedd" },
  ],
  // Only "Customer" is in use.
  contacts: [buildContact({ tags: [1] })],
};

export const Default = ({ data = defaultData }: { data?: Partial<Db> }) => (
  <StoryWrapper data={data}>
    <TagsCard tagsResource="tags" usedBy="contacts" />
  </StoryWrapper>
);

export const Empty = () => <Default data={{ tags: [] }} />;

// Company tags are a separate catalog, counted against companies.
export const CompanyTags = () => (
  <StoryWrapper
    data={{
      tags: [{ id: 1, name: "Customer", color: "#eddcd2" }],
      company_tags: [
        { id: 1, name: "Key account", color: "#bcd4e6" },
        { id: 2, name: "Partner", color: "#c5dedd" },
      ],
      // Only "Key account" is in use; the contact tag with the same id must
      // not count.
      companies: [buildCompany({ tags: [1] })],
      contacts: [buildContact({ tags: [2] })],
    }}
  >
    <TagsCard tagsResource="company_tags" usedBy="companies" />
  </StoryWrapper>
);
