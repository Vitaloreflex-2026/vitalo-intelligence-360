import { addDays } from "date-fns/addDays";
import { isValid } from "date-fns/isValid";
import { startOfDay } from "date-fns/startOfDay";

import type { Deal } from "../types";

/** The three paperwork deadlines a contract is nagged about. */
export type DealAlertKind = "quote_signed" | "portal_data_sent" | "opco_file";

export interface DealAlert {
  deal: Deal;
  kind: DealAlertKind;
  /** Date the action must be done by. */
  dueDate: Date;
  /** The due date is behind us and the action is still pending. */
  isOverdue: boolean;
}

/**
 * Days between the expected closing date and each deadline. The quote must be
 * signed a month ahead; the portal filing and the OPCO submission only become
 * due once the contract is over.
 */
const QUOTE_SIGNATURE_LEAD_DAYS = -30;
const PORTAL_FILING_GRACE_DAYS = 8;
const OPCO_SUBMISSION_GRACE_DAYS = 1;

interface AlertRule {
  kind: DealAlertKind;
  /** Whether this rule watches the contract at all. */
  applies: (deal: Deal) => boolean;
  /** Whether the action is still pending. */
  isPending: (deal: Deal) => boolean;
  /** Offset of the deadline from the expected closing date, in days. */
  dueOffsetDays: number;
  /**
   * Offset from which the alert starts showing. It is earlier than the due date
   * when the deadline leaves a grace period, so the alert is raised while there
   * is still time to act.
   */
  startOffsetDays: number;
}

const RULES: AlertRule[] = [
  {
    kind: "quote_signed",
    applies: () => true,
    isPending: (deal) => deal.quote_signed !== true,
    dueOffsetDays: QUOTE_SIGNATURE_LEAD_DAYS,
    startOffsetDays: QUOTE_SIGNATURE_LEAD_DAYS,
  },
  {
    kind: "portal_data_sent",
    applies: () => true,
    isPending: (deal) => deal.portal_data_sent !== true,
    dueOffsetDays: PORTAL_FILING_GRACE_DAYS,
    // Raised the day the contract ends, so the eight-day window is usable.
    startOffsetDays: 0,
  },
  {
    kind: "opco_file",
    applies: (deal) => deal.funding_type === "opco",
    isPending: (deal) => deal.opco_file_submitted !== true,
    dueOffsetDays: OPCO_SUBMISSION_GRACE_DAYS,
    startOffsetDays: OPCO_SUBMISSION_GRACE_DAYS,
  },
];

const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * The closing date as a local day. A plain `YYYY-MM-DD` value is parsed
 * component by component, because `new Date("2026-06-30")` reads it as UTC
 * midnight — which lands on the previous day in any timezone behind UTC.
 * `dealUtils.formatISODateString` avoids the same trap on the display path.
 */
const parseClosingDate = (value: string): Date => {
  if (ISO_DATE_ONLY.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  return startOfDay(new Date(value));
};

/**
 * Stage of a contract that was never signed. Nothing is owed on it: no quote to
 * chase, no portal filing, no OPCO file. It is the shipped `lost` stage value
 * (see `defaultDealStages`); a project renaming its stages should update this.
 */
const LOST_STAGE = "lost";

/**
 * The paperwork a contract still owes, as the notification bell reports it.
 * Archived contracts, lost contracts and contracts without a usable closing
 * date are ignored — every deadline here is relative to that date.
 */
export const getDealAlerts = (
  deals: Deal[],
  today: Date = new Date(),
): DealAlert[] => {
  const reference = startOfDay(today);

  return deals.flatMap((deal) => {
    if (deal.archived_at || deal.stage === LOST_STAGE) return [];

    const closingDate = parseClosingDate(deal.expected_closing_date);
    if (!isValid(closingDate)) return [];

    return RULES.filter(
      (rule) =>
        rule.applies(deal) &&
        rule.isPending(deal) &&
        reference >= addDays(closingDate, rule.startOffsetDays),
    ).map((rule) => {
      const dueDate = addDays(closingDate, rule.dueOffsetDays);
      return {
        deal,
        kind: rule.kind,
        dueDate,
        isOverdue: reference > dueDate,
      };
    });
  });
};
