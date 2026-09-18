import type { Meta } from "@storybook/react-vite";
import { StoryWrapper } from "@/test/StoryWrapper";
import type { Db } from "../providers/fakerest/dataGenerator/types";
import type { Choice, SaleDocument } from "../types";
import { SaleDocumentsCard } from "./SaleDocumentsCard";

const meta = {
  title: "Atomic CRM/Documents/SaleDocumentsCard",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;

const yearsAgo = (years: number) => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  return date.toISOString();
};

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
    label: "RIB",
    requires_renewal: false,
  },
  {
    category: "user_document_type",
    id: 3,
    label: "Attestation URSSAF",
    requires_renewal: true,
  },
];

const defaultData: Partial<Db> = {
  choices: documentTypes,
  sales_documents: [
    {
      created_at: yearsAgo(0),
      file: { src: "data:text/plain;base64,aWQ=", title: "cni.pdf" },
      id: 1,
      sales_id: 0,
      type: "Carte d'identite",
    },
    {
      created_at: yearsAgo(2),
      file: { src: "data:text/plain;base64,dXI=", title: "urssaf.pdf" },
      id: 2,
      sales_id: 0,
      type: "Attestation URSSAF",
    },
  ] as SaleDocument[],
};

export const Default = ({ data = defaultData }: { data?: Partial<Db> }) => (
  <StoryWrapper data={data}>
    <SaleDocumentsCard />
  </StoryWrapper>
);

export const WithoutDocumentTypes = () => (
  <Default data={{ choices: [], sales_documents: [] }} />
);
