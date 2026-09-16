import type { Meta } from "@storybook/react-vite";
import { addDays } from "date-fns/addDays";
import { StoryWrapper, buildContact } from "@/test/StoryWrapper";
import type { Db } from "../providers/fakerest/dataGenerator/types";
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
  ] as Db["tasks"],
};

export const Default = ({ data = defaultData }: { data?: Partial<Db> }) => (
  <StoryWrapper data={data}>
    <MeetingNotifications />
  </StoryWrapper>
);
