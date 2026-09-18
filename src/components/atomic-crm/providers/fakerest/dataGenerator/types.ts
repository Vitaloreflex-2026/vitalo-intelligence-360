import type {
  Assessment,
  Choice,
  Company,
  Contact,
  ContactNote,
  Deal,
  DealNote,
  Sale,
  SaleDocument,
  Tag,
  Task,
} from "../../../types";
import type { ConfigurationContextValue } from "../../../root/ConfigurationContext";

export interface Db {
  assessments: Assessment[];
  choices: Choice[];
  companies: Company[];
  contacts: Contact[];
  contact_notes: ContactNote[];
  deals: Deal[];
  deal_notes: DealNote[];
  sales: Sale[];
  sales_documents: SaleDocument[];
  tags: Tag[];
  tasks: Task[];
  configuration: Array<{ id: number; config: ConfigurationContextValue }>;
}
