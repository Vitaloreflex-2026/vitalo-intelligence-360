import type { Meta } from "@storybook/react-vite";
import { buildContact, StoryWrapper } from "@/test/StoryWrapper";
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
    <TagsCard />
  </StoryWrapper>
);

export const Empty = () => <Default data={{ tags: [] }} />;
