export const LEAD_STATUSES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL",
  "WON",
  "LOST",
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_SOURCES = [
  "WEBSITE",
  "REFERRAL",
  "COLD_OUTREACH",
  "EVENT",
  "OTHER",
] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

// STATUS_CHANGE entries are written by the system, never submitted by users.
export const USER_ACTIVITY_TYPES = ["NOTE", "CALL", "EMAIL", "MEETING"] as const;
export const ACTIVITY_TYPES = [...USER_ACTIVITY_TYPES, "STATUS_CHANGE"] as const;
export type UserActivityType = (typeof USER_ACTIVITY_TYPES)[number];
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  PROPOSAL: "Proposal",
  WON: "Won",
  LOST: "Lost",
};

export const SOURCE_LABELS: Record<LeadSource, string> = {
  WEBSITE: "Website",
  REFERRAL: "Referral",
  COLD_OUTREACH: "Cold outreach",
  EVENT: "Event",
  OTHER: "Other",
};

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  NOTE: "Note",
  CALL: "Call",
  EMAIL: "Email",
  MEETING: "Meeting",
  STATUS_CHANGE: "Status change",
};

export function statusLabel(status: string): string {
  return STATUS_LABELS[status as LeadStatus] ?? status;
}

export function sourceLabel(source: string): string {
  return SOURCE_LABELS[source as LeadSource] ?? source;
}

export function activityLabel(type: string): string {
  return ACTIVITY_LABELS[type as ActivityType] ?? type;
}
