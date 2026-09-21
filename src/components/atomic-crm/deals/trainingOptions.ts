/**
 * Fixed option lists of the training half of a contract. Names are translation
 * keys; the stored value is the stable id, so relabeling never rewrites data.
 * The OPCO list is user-extensible instead and lives in the `choices` table.
 */

/** Shape of the delivered training. */
export const trainingTypes = [
  { id: "collective", name: "crm.training_type.collective" },
  { id: "individual_workshop", name: "crm.training_type.individual_workshop" },
  { id: "conference", name: "crm.training_type.conference" },
];

/** Format of the QVCT workshop. */
export const qvctWorkshopTypes = [
  { id: "webinar", name: "crm.qvct_workshop_type.webinar" },
  { id: "collective_onsite", name: "crm.qvct_workshop_type.collective_onsite" },
  { id: "individual", name: "crm.qvct_workshop_type.individual" },
];

/** Who pays for the training. Picking `opco` opens the OPCO details section. */
export const fundingTypes = [
  { id: "opco", name: "crm.funding_type.opco" },
  { id: "hr_hse", name: "crm.funding_type.hr_hse" },
  { id: "cse", name: "crm.funding_type.cse" },
  { id: "other", name: "crm.funding_type.other" },
];
