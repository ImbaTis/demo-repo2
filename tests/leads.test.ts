import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import {
  DuplicateEmailError,
  LeadNotFoundError,
  addActivity,
  createLead,
  deleteLead,
  getLead,
  listLeads,
  updateLead,
} from "@/lib/leads";
import { leadFiltersSchema, leadInputSchema } from "@/lib/validation";

const make = (data: Record<string, unknown>) => createLead(leadInputSchema.parse(data));
const filters = (q: Record<string, string> = {}) => leadFiltersSchema.parse(q);

beforeEach(async () => {
  await prisma.activity.deleteMany();
  await prisma.lead.deleteMany();
});

afterAll(() => prisma.$disconnect());

describe("createLead", () => {
  it("creates a lead and logs its creation", async () => {
    const lead = await make({ name: "Ada", email: "ada@example.com" });
    const full = await getLead(lead.id);
    expect(full?.status).toBe("NEW");
    expect(full?.activities).toHaveLength(1);
    expect(full?.activities[0]).toMatchObject({
      type: "STATUS_CHANGE",
      body: "Lead created with status New",
    });
  });

  it("rejects a duplicate email regardless of case", async () => {
    await make({ name: "Ada", email: "ada@example.com" });
    await expect(make({ name: "Imposter", email: "ADA@example.com" })).rejects.toBeInstanceOf(
      DuplicateEmailError,
    );
  });

  it("allows many leads without an email", async () => {
    await make({ name: "One" });
    await make({ name: "Two" });
    expect(await listLeads(filters())).toHaveLength(2);
  });
});

describe("updateLead", () => {
  it("logs status changes with an optional note", async () => {
    const lead = await make({ name: "Ada" });
    await updateLead(lead.id, { status: "CONTACTED" }, "Left a voicemail");
    const full = await getLead(lead.id);
    expect(full?.status).toBe("CONTACTED");
    expect(full?.activities[0].body).toBe(
      "Status changed from New to Contacted — Left a voicemail",
    );
  });

  it("does not log when the status is unchanged", async () => {
    const lead = await make({ name: "Ada" });
    await updateLead(lead.id, { status: "NEW", company: "Engines" });
    const full = await getLead(lead.id);
    expect(full?.company).toBe("Engines");
    expect(full?.activities).toHaveLength(1);
  });

  it("leaves fields that were not sent untouched and clears blanked ones", async () => {
    const lead = await make({ name: "Ada", company: "Engines", phone: "123" });
    await updateLead(lead.id, { company: undefined });
    const full = await getLead(lead.id);
    expect(full?.company).toBeNull();
    expect(full?.phone).toBe("123");
  });

  it("rejects taking another lead's email", async () => {
    await make({ name: "Ada", email: "ada@example.com" });
    const other = await make({ name: "Grace", email: "grace@example.com" });
    await expect(updateLead(other.id, { email: "ada@example.com" })).rejects.toBeInstanceOf(
      DuplicateEmailError,
    );
  });

  it("throws for a missing lead", async () => {
    await expect(updateLead("missing", { name: "X" })).rejects.toBeInstanceOf(LeadNotFoundError);
  });
});

describe("activities", () => {
  it("adds an activity and returns the timeline newest first", async () => {
    const lead = await make({ name: "Ada" });
    await addActivity(lead.id, { type: "CALL", body: "Intro call" });
    const full = await getLead(lead.id);
    expect(full?.activities.map((a) => a.type)).toEqual(["CALL", "STATUS_CHANGE"]);
  });

  it("throws for a missing lead", async () => {
    await expect(addActivity("missing", { type: "NOTE", body: "hi" })).rejects.toBeInstanceOf(
      LeadNotFoundError,
    );
  });
});

describe("deleteLead", () => {
  it("removes the lead and its activities", async () => {
    const lead = await make({ name: "Ada" });
    await addActivity(lead.id, { type: "NOTE", body: "hi" });
    await deleteLead(lead.id);
    expect(await getLead(lead.id)).toBeNull();
    expect(await prisma.activity.count()).toBe(0);
  });

  it("throws for a missing lead", async () => {
    await expect(deleteLead("missing")).rejects.toBeInstanceOf(LeadNotFoundError);
  });
});

describe("listLeads", () => {
  beforeEach(async () => {
    await make({ name: "Ada", company: "Engines", status: "QUALIFIED", source: "REFERRAL", value: "100" });
    await make({ name: "Grace", email: "grace@compiler.example", status: "NEW", source: "EVENT", value: "500" });
    await make({ name: "Alan", status: "NEW", source: "REFERRAL" });
  });

  it("searches across name, company and email, case-insensitively", async () => {
    expect((await listLeads(filters({ q: "engines" }))).map((l) => l.name)).toEqual(["Ada"]);
    expect((await listLeads(filters({ q: "COMPILER" }))).map((l) => l.name)).toEqual(["Grace"]);
  });

  it("filters by status and source", async () => {
    const result = await listLeads(filters({ status: "NEW", source: "REFERRAL" }));
    expect(result.map((l) => l.name)).toEqual(["Alan"]);
  });

  it("sorts by value with empty values last", async () => {
    const desc = await listLeads(filters({ sort: "value_desc" }));
    expect(desc.map((l) => l.name)).toEqual(["Grace", "Ada", "Alan"]);
    const asc = await listLeads(filters({ sort: "value_asc" }));
    expect(asc.map((l) => l.name)).toEqual(["Ada", "Grace", "Alan"]);
  });

  it("sorts by name", async () => {
    const result = await listLeads(filters({ sort: "name" }));
    expect(result.map((l) => l.name)).toEqual(["Ada", "Alan", "Grace"]);
  });
});
