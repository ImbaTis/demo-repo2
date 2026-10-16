import { describe, expect, it } from "vitest";
import { activityInputSchema, leadFiltersSchema, leadInputSchema, leadUpdateSchema } from "@/lib/validation";

describe("leadInputSchema", () => {
  it("trims text, lowercases email and coerces value", () => {
    const lead = leadInputSchema.parse({
      name: "  Ada  ",
      email: " Ada@Example.COM ",
      value: "2500",
    });
    expect(lead).toMatchObject({ name: "Ada", email: "ada@example.com", value: 2500 });
  });

  it("applies default status and source", () => {
    expect(leadInputSchema.parse({ name: "Ada" })).toMatchObject({ status: "NEW", source: "OTHER" });
  });

  it("treats blank optional fields as not provided", () => {
    const lead = leadInputSchema.parse({ name: "Ada", email: "", company: "  ", value: "" });
    expect(lead.email).toBeUndefined();
    expect(lead.company).toBeUndefined();
    expect(lead.value).toBeUndefined();
  });

  it("rejects a missing name, a bad email and invalid values", () => {
    const result = leadInputSchema.safeParse({ name: " ", email: "nope", value: "-5", status: "MAYBE" });
    expect(result.success).toBe(false);
    const paths = result.error!.issues.map((i) => i.path[0]);
    expect(paths).toEqual(expect.arrayContaining(["name", "email", "value", "status"]));
  });

  it("rejects fractional and non-numeric values", () => {
    expect(leadInputSchema.safeParse({ name: "A", value: "1.5" }).success).toBe(false);
    expect(leadInputSchema.safeParse({ name: "A", value: "lots" }).success).toBe(false);
  });
});

describe("leadUpdateSchema", () => {
  it("only includes the fields that were sent", () => {
    expect(leadUpdateSchema.parse({ status: "WON" })).toEqual({ status: "WON" });
  });

  it("keeps an explicitly blanked field so it can be cleared", () => {
    const update = leadUpdateSchema.parse({ company: "" });
    expect("company" in update).toBe(true);
    expect(update.company).toBeUndefined();
  });
});

describe("activityInputSchema", () => {
  it("does not let users write status-change entries", () => {
    expect(activityInputSchema.safeParse({ type: "STATUS_CHANGE", body: "x" }).success).toBe(false);
  });

  it("requires a body", () => {
    expect(activityInputSchema.safeParse({ type: "NOTE", body: "   " }).success).toBe(false);
  });
});

describe("leadFiltersSchema", () => {
  it("falls back to defaults on junk query params", () => {
    expect(leadFiltersSchema.parse({ status: "NOPE", source: "", sort: "sideways" })).toEqual({
      q: undefined,
      status: undefined,
      source: undefined,
      sort: "newest",
    });
  });
});
