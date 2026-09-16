import { add } from "date-fns";
import { datatype, lorem, random } from "faker/locale/en_US";

import type { Deal } from "../../../types";
import { choiceLabels } from "./choices";
import type { Db } from "./types";
import { randomDate } from "./utils";

export const generateDeals = (db: Db): Deal[] => {
  const deals = Array.from(Array(50).keys()).map((id) => {
    const company = random.arrayElement(db.companies);
    company.nb_deals = (company.nb_deals ?? 0) + 1;
    const contacts = random.arrayElements(
      db.contacts.filter((contact) => contact.company_id === company.id),
      datatype.number({ min: 1, max: 3 }),
    );
    const created_at = randomDate(new Date(company.created_at)).toISOString();

    const expected_closing_date = randomDate(
      new Date(created_at),
      add(new Date(created_at), { months: 6 }),
    )
      .toISOString()
      .split("T")[0];

    return {
      id,
      company_id: company.id,
      contact_ids: contacts.map((contact) => contact.id),
      reference: `DOS-${String(id + 1).padStart(4, "0")}`,
      confidentiality: random.arrayElement([
        "prospect",
        "client",
        "partner",
      ] as const),
      origin: random.arrayElement(choiceLabels.deal_origin),
      objectives: random.arrayElements(
        choiceLabels.deal_objective,
        datatype.number({ min: 1, max: 3 }),
      ),
      motivation: lorem.paragraph(),
      other_expectations: lorem.sentence(),
      created_at,
      updated_at: randomDate(new Date(created_at)).toISOString(),
      expected_closing_date,
      sales_id: company.sales_id!,
    };
  });
  return deals;
};
