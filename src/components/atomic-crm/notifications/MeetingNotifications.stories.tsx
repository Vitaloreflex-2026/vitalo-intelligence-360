import type { Meta } from "@storybook/react-vite";
import { addDays } from "date-fns/addDays";
import { StoryWrapper, buildContact, buildDeal } from "@/test/StoryWrapper";
import type { Db } from "../providers/fakerest/dataGenerator/types";
import type { Choice, SaleDocument } from "../types";
import { MeetingNotifications } from "./MeetingNotifications";

const meta = {
  title: "Atomic CRM/Notifications/MeetingNotifications",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;

const at = (dayOffset: number, hours: number) => {
  const date = addDays(new Date(), dayOffset);
  date.setHours(hours, 0, 0, 0);
  return date.toISOString();
};

const defaultData: Partial<Db> = {
  // No document type is expected here, to keep this fixture about meetings.
  choices: [],
  contacts: [buildContact({ first_name: "Ada", id: 1, last_name: "Lovelace" })],
  tasks: [
    {
      contact_id: 1,
      due_date: at(0, 9),
      id: 1,
      sales_id: 0,
      text: "Bilan de formation",
      type: "meeting",
    },
    {
      contact_id: 1,
      due_date: at(0, 15),
      id: 2,
      sales_id: 0,
      text: "Point hebdomadaire",
      type: "call",
    },
    {
      contact_id: 1,
      due_date: at(1, 11),
      id: 3,
      sales_id: 0,
      text: "Rendez-vous de demain",
      type: "meeting",
    },
    {
      contact_id: 1,
      due_date: at(-2, 10),
      id: 4,
      sales_id: 0,
      text: "Rendez-vous oublie",
      type: "meeting",
    },
    {
      contact_id: 1,
      done_date: at(-3, 11),
      due_date: at(-3, 10),
      id: 5,
      sales_id: 0,
      text: "Rendez-vous deja traite",
      type: "meeting",
    },
  ] as Db["tasks"],
};

export const Default = ({ data = defaultData }: { data?: Partial<Db> }) => (
  <StoryWrapper data={data}>
    <MeetingNotifications />
  </StoryWrapper>
);

const yearsAgo = (years: number) => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  return date.toISOString();
};

const documentTypes: Choice[] = [
  {
    category: "user_document_type",
    id: 100,
    label: "RIB",
    requires_renewal: false,
  },
  {
    category: "user_document_type",
    id: 101,
    label: "Attestation URSSAF",
    requires_renewal: true,
  },
];

/** One paper never filed, one filed too long ago — both wait in the panel. */
export const WithDocuments = () => (
  <Default
    data={{
      ...defaultData,
      choices: documentTypes,
      sales_documents: [
        {
          created_at: yearsAgo(2),
          file: { src: "data:text/plain;base64,dXI=", title: "urssaf.pdf" },
          id: 1,
          sales_id: 0,
          type: "Attestation URSSAF",
        },
      ] as SaleDocument[],
    }}
  />
);

const daysAgo = (days: number) =>
  addDays(new Date(), -days).toISOString().split("T")[0];

/**
 * Three contracts, each owing a different piece of paperwork: an unsigned quote
 * whose deadline is long gone, a portal filing still within its eight days, and
 * an OPCO file never submitted.
 */
export const WithDealAlerts = () => (
  <Default
    data={{
      ...defaultData,
      deals: [
        buildDeal({
          expected_closing_date: daysAgo(-10),
          id: 1,
          name: "Prevention TMS",
          portal_data_sent: true,
        }),
        buildDeal({
          expected_closing_date: daysAgo(2),
          id: 2,
          name: "Atelier sommeil",
          quote_signed: true,
        }),
        buildDeal({
          expected_closing_date: daysAgo(30),
          funding_type: "opco",
          id: 3,
          name: "Conference RPS",
          portal_data_sent: true,
          quote_signed: true,
        }),
      ],
    }}
  />
);
