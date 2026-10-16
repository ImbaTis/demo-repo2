import { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { statusLabel } from "./constants";
import type {
  ActivityInput,
  LeadFilters,
  LeadInput,
  LeadUpdate,
} from "./validation";

export class DuplicateEmailError extends Error {
  constructor() {
    super("A lead with this email already exists");
    this.name = "DuplicateEmailError";
  }
}

export class LeadNotFoundError extends Error {
  constructor() {
    super("Lead not found");
    this.name = "LeadNotFoundError";
  }
}

function isUniqueViolation(e: unknown) {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
}

function isNotFound(e: unknown) {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025";
}

const ORDER_BY: Record<LeadFilters["sort"], Prisma.LeadOrderByWithRelationInput[]> = {
  newest: [{ createdAt: "desc" }],
  oldest: [{ createdAt: "asc" }],
  updated: [{ updatedAt: "desc" }],
  name: [{ name: "asc" }],
  value_desc: [{ value: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
  value_asc: [{ value: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
};

export async function listLeads(filters: LeadFilters) {
  const where: Prisma.LeadWhereInput = {};
  if (filters.status) where.status = filters.status;
  if (filters.source) where.source = filters.source;
  if (filters.q) {
    // SQLite's LIKE is case-insensitive for ASCII, which is what we want here.
    where.OR = [
      { name: { contains: filters.q } },
      { company: { contains: filters.q } },
      { email: { contains: filters.q } },
      { phone: { contains: filters.q } },
    ];
  }
  return prisma.lead.findMany({ where, orderBy: ORDER_BY[filters.sort] });
}

export async function getLead(id: string) {
  return prisma.lead.findUnique({
    where: { id },
    include: { activities: { orderBy: { createdAt: "desc" } } },
  });
}

export async function createLead(input: LeadInput) {
  try {
    return await prisma.lead.create({
      data: {
        ...input,
        activities: {
          create: {
            type: "STATUS_CHANGE",
            body: `Lead created with status ${statusLabel(input.status)}`,
          },
        },
      },
    });
  } catch (e) {
    if (isUniqueViolation(e)) throw new DuplicateEmailError();
    throw e;
  }
}

/**
 * Updates a lead. A status change is recorded in the activity timeline,
 * with `statusNote` appended when given.
 */
export async function updateLead(id: string, input: LeadUpdate, statusNote?: string) {
  try {
    return await prisma.$transaction(async (tx) => {
      const current = await tx.lead.findUnique({ where: { id }, select: { status: true } });
      if (!current) throw new LeadNotFoundError();

      // A form clearing an optional field sends undefined; store that as null.
      const data: Prisma.LeadUpdateInput = {};
      for (const [key, val] of Object.entries(input)) {
        (data as Record<string, unknown>)[key] = val === undefined ? null : val;
      }
      const lead = await tx.lead.update({ where: { id }, data });

      if (input.status && input.status !== current.status) {
        const note = statusNote?.trim();
        await tx.activity.create({
          data: {
            leadId: id,
            type: "STATUS_CHANGE",
            body:
              `Status changed from ${statusLabel(current.status)} to ${statusLabel(input.status)}` +
              (note ? ` — ${note}` : ""),
          },
        });
      }
      return lead;
    });
  } catch (e) {
    if (isUniqueViolation(e)) throw new DuplicateEmailError();
    throw e;
  }
}

export async function deleteLead(id: string) {
  try {
    await prisma.lead.delete({ where: { id } });
  } catch (e) {
    if (isNotFound(e)) throw new LeadNotFoundError();
    throw e;
  }
}

export async function addActivity(leadId: string, input: ActivityInput) {
  try {
    const [activity] = await prisma.$transaction([
      prisma.activity.create({ data: { leadId, ...input } }),
      // Logging activity counts as touching the lead.
      prisma.lead.update({ where: { id: leadId }, data: { updatedAt: new Date() } }),
    ]);
    return activity;
  } catch (e) {
    if (
      isNotFound(e) ||
      (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003")
    ) {
      throw new LeadNotFoundError();
    }
    throw e;
  }
}
