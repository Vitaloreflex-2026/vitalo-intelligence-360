import type { Meta } from "@storybook/react-vite";
import { StoryWrapper } from "@/test/StoryWrapper";
import type { Db } from "../providers/fakerest/dataGenerator/types";
import type { Choice, SaleDocument } from "../types";
import { SaleDocumentsDownloadCard } from "./SaleDocumentsDownloadCard";

const meta = {
  title: "Atomic CRM/Documents/SaleDocumentsDownloadCard",
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
    label: "RIB",
    requires_renewal: false,
  },
];

const filedDocuments = [
  {
    created_at: "2026-09-01T09:00:00.000Z",
    file: { src: "data:text/plain;base64,aWQ=", title: "cni.pdf" },
    id: 1,
    sales_id: 0,
    type: "Carte d'identite",
  },
] as SaleDocument[];

const Wrapper = ({ data }: { data: Partial<Db> }) => (
  <StoryWrapper data={data}>
    <SaleDocumentsDownloadCard salesId={0} archiveName="Jane Doe" />
  </StoryWrapper>
);

export const Default = () => (
  <Wrapper data={{ choices: documentTypes, sales_documents: filedDocuments }} />
);

export const NothingProvided = () => (
  <Wrapper data={{ choices: documentTypes, sales_documents: [] }} />
);
