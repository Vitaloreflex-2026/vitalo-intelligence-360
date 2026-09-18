import type { Meta } from "@storybook/react-vite";
import { StoryWrapper } from "@/test/StoryWrapper";
import type { Db } from "../providers/fakerest/dataGenerator/types";
import type { Choice } from "../types";
import { DocumentTypesCard } from "./DocumentTypesCard";

const meta = {
  title: "Atomic CRM/Settings/DocumentTypesCard",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;

const documentTypes: Choice[] = [
  {
    category: "user_document_type",
    id: 1,
    label: "Carte d'identite",
    requires_renewal: false,
  },
  {
    category: "user_document_type",
    id: 2,
    label: "Attestation URSSAF",
    requires_renewal: true,
  },
];

export const Default = ({
  data = { choices: documentTypes },
}: {
  data?: Partial<Db>;
}) => (
  <StoryWrapper data={data}>
    <DocumentTypesCard />
  </StoryWrapper>
);

export const Empty = () => <Default data={{ choices: [] }} />;
