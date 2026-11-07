import { prisma } from "../src/lib/db";
import { addActivity, createLead, updateLead } from "../src/lib/leads";
import { leadInputSchema, type LeadInput } from "../src/lib/validation";
import type { LeadStatus } from "../src/lib/constants";

type SeedLead = Omit<LeadInput, "status"> & { status: LeadStatus; history?: string[] };

const leads: SeedLead[] = [
  { name: "Ada Lovelace", company: "Analytical Engines Ltd", email: "ada@engines.example", phone: "+44 20 7946 0001", status: "QUALIFIED", source: "REFERRAL", value: 24000, notes: "Interested in the annual plan.", history: ["Intro call went well — wants pricing for 20 seats."] },
  { name: "Grace Hopper", company: "Compiler Co", email: "grace@compiler.example", phone: "+1 555 0100", status: "PROPOSAL", source: "EVENT", value: 52000, notes: "Met at DevConf.", history: ["Sent proposal v1."] },
  { name: "Alan Turing", company: "Bletchley Analytics", email: "alan@bletchley.example", status: "NEW", source: "WEBSITE", value: 8000 },
  { name: "Katherine Johnson", company: "Orbital Paths", email: "katherine@orbital.example", status: "CONTACTED", source: "COLD_OUTREACH", value: 15000 },
  { name: "Linus Torvalds", company: "Kernel Works", email: "linus@kernel.example", status: "WON", source: "REFERRAL", value: 40000 },
  { name: "Margaret Hamilton", company: "Apollo Software", email: "margaret@apollo.example", status: "LOST", source: "WEBSITE", value: 12000, notes: "Went with an in-house tool." },
];

async function main() {
  await prisma.activity.deleteMany();
  await prisma.lead.deleteMany();

  for (const { status, history = [], ...rest } of leads) {
    const lead = await createLead(leadInputSchema.parse({ ...rest, status: "NEW" }));
    for (const body of history) await addActivity(lead.id, { type: "NOTE", body });
    if (status !== "NEW") await updateLead(lead.id, { status });
  }
  console.log(`Seeded ${leads.length} leads.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
