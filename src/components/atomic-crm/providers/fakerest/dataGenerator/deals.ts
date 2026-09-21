import { add } from "date-fns";
import { datatype, lorem, random } from "faker/locale/en_US";

import {
  defaultDealCategories,
  defaultDealStages,
} from "../../../root/defaultConfiguration";
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
    const lowercaseName = lorem.words();
    const created_at = randomDate(new Date(company.created_at)).toISOString();

    const expected_closing_date = randomDate(
      new Date(created_at),
      add(new Date(created_at), { months: 6 }),
    )
      .toISOString()
      .split("T")[0];

    return {
      id,
      name: lowercaseName[0].toUpperCase() + lowercaseName.slice(1),
      company_id: company.id,
      contact_ids: contacts.map((contact) => contact.id),
      category: random.arrayElement(defaultDealCategories).value,
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
      stage: random.arrayElement(defaultDealStages).value,
      description: lorem.paragraphs(datatype.number({ min: 1, max: 4 })),
      amount: datatype.number(1000) * 100,
      created_at,
      updated_at: randomDate(new Date(created_at)).toISOString(),
      expected_closing_date,
      sales_id: company.sales_id!,
      index: 0,
      // Training delivery, so the demo shows the BPF half of a contract
      trainer_ids: random
        .arrayElements(db.sales, datatype.number({ min: 1, max: 2 }))
        .map((sale) => sale.id),
      training_type: random.arrayElement([
        "collective",
        "individual_workshop",
        "conference",
      ] as const),
      nb_trained_managers: datatype.number({ min: 0, max: 12 }),
      nb_trained_non_managers: datatype.number({ min: 0, max: 40 }),
      hours_delivered: datatype.number({ min: 2, max: 40 }),
      qvct_workshop_type: random.arrayElement([
        "webinar",
        "collective_onsite",
        "individual",
      ] as const),
      passport_eligible: datatype.boolean(),
      portal_data_sent: datatype.boolean(),
      qualiopi: datatype.boolean(),
      funding_type: random.arrayElement([
        "opco",
        "hr_hse",
        "cse",
        "other",
      ] as const),
      quote_signed: datatype.boolean(),
      agreement_signed: datatype.boolean(),
      amount_invoiced_incl_tax: datatype.number(1000) * 100,
      appropriation_rate: datatype.number({ min: 50, max: 100 }),
      satisfaction_rate: datatype.number({ min: 50, max: 100 }),
    };
  });
  // compute index based on stage
  defaultDealStages.forEach((stage) => {
    deals
      .filter((deal) => deal.stage === stage.value)
      .forEach((deal, index) => {
        deals[deal.id].index = index;
      });
  });
  return deals;
};
