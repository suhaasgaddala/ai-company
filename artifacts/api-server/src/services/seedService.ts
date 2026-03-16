import { db } from "@workspace/db";
import { runsTable, transcriptMessagesTable, artifactsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const DEMO_RUN_ID = "demo-run-001";

export async function seedDemoData() {
  const existing = await db.select().from(runsTable).where(eq(runsTable.id, DEMO_RUN_ID));
  if (existing.length > 0) return;

  await db.insert(runsTable).values({
    id: DEMO_RUN_ID,
    status: "completed",
    phase: "founders_complete",
    userKeywords: "healthcare, AI, analytics",
    companyName: "NexaHealth AI",
    companyTagline: "AI-Powered Healthcare Analytics for Better Patient Outcomes",
    selectedIdeaTitle: "NexaHealth AI Platform",
    selectedIdeaSummary:
      "An AI-powered healthcare analytics platform that helps hospitals and clinics predict patient outcomes, optimize treatment plans, and reduce readmission rates using machine learning on EHR data.",
    winnerAgentKey: "tech",
  });

  const messages = [
    {
      runId: DEMO_RUN_ID,
      phase: "setup",
      agentKey: "system",
      roleType: "system",
      messageType: "system",
      content: "Company run initialized with keywords: healthcare, AI, analytics. Starting founder debate...",
      sortOrder: 1,
    },
    {
      runId: DEMO_RUN_ID,
      phase: "founders",
      agentKey: "tech",
      roleType: "founder",
      messageType: "idea",
      content:
        "I propose we build NexaHealth AI - an ML platform that integrates with existing EHR systems to predict patient deterioration 24-48 hours before it happens. We can use transformer models fine-tuned on clinical data. The technical moat is in the model architecture and our data pipeline that handles HIPAA-compliant data processing in real-time.",
      sortOrder: 2,
    },
    {
      runId: DEMO_RUN_ID,
      phase: "founders",
      agentKey: "market",
      roleType: "founder",
      messageType: "analysis",
      content:
        "The healthcare AI market is projected to reach $45B by 2030. Hospital systems are desperate for solutions that reduce readmission penalties - each readmission costs hospitals $15K-$25K. I see a clear B2B enterprise play targeting the top 200 hospital systems first. Our TAM is massive and the timing is perfect with CMS pushing value-based care.",
      sortOrder: 3,
    },
    {
      runId: DEMO_RUN_ID,
      phase: "founders",
      agentKey: "skeptic",
      roleType: "founder",
      messageType: "critique",
      content:
        "Hold on - healthcare AI is a graveyard of failed startups. The sales cycle is 12-18 months, regulatory burden is enormous, and hospitals are notoriously slow adopters. How do we survive the long sales cycle? What about FDA clearance for clinical decision support? And getting access to quality training data is the real bottleneck here.",
      sortOrder: 4,
    },
    {
      runId: DEMO_RUN_ID,
      phase: "founders",
      agentKey: "finance",
      roleType: "founder",
      messageType: "analysis",
      content:
        "Let me run the numbers. If we target enterprise contracts at $200K-500K ARR per hospital system, we need 20 customers to hit $5M ARR. With a 15-month sales cycle, we need $3M seed to get to first revenue. Unit economics look strong - 80%+ gross margins on SaaS with implementation services as an onramp. I recommend a $3.5M seed round with 24 months runway.",
      sortOrder: 5,
    },
    {
      runId: DEMO_RUN_ID,
      phase: "founders",
      agentKey: "tech",
      roleType: "founder",
      messageType: "response",
      content:
        "Great points from the skeptic. For FDA, we start as a clinical decision *support* tool (not diagnostic), which puts us in Class II - much faster clearance path. For data access, we partner with 2-3 academic medical centers who get free access in exchange for anonymized training data. We can have an MVP in 4 months using existing open-source clinical NLP models as a starting point.",
      sortOrder: 6,
    },
    {
      runId: DEMO_RUN_ID,
      phase: "founders",
      agentKey: "system",
      roleType: "system",
      messageType: "decision",
      content:
        "Consensus reached: The founders have agreed on NexaHealth AI. Moving to worker phase for deliverable generation.",
      sortOrder: 7,
    },
  ];

  await db.insert(transcriptMessagesTable).values(messages);

  await db.insert(artifactsTable).values([
    {
      runId: DEMO_RUN_ID,
      artifactType: "product_spec",
      title: "Product Specification",
      contentText: "## NexaHealth AI - Product Spec\n\n### Vision\nAI-powered predictive analytics for healthcare...\n\n### Core Features (MVP)\n1. EHR data integration pipeline\n2. Patient risk scoring engine\n3. Clinical dashboard for care teams\n4. Alert system for high-risk patients\n\n*Full spec generation pending worker loop implementation*",
    },
    {
      runId: DEMO_RUN_ID,
      artifactType: "gtm_plan",
      title: "Go-to-Market Plan",
      contentText: "## NexaHealth AI - GTM Strategy\n\n### Target Segment\nTop 200 US hospital systems by bed count\n\n### Launch Strategy\n1. Partner with 3 academic medical centers\n2. Pilot program with guaranteed outcomes\n3. Conference presence at HIMSS and HLTH\n\n*Full GTM plan pending worker loop implementation*",
    },
    {
      runId: DEMO_RUN_ID,
      artifactType: "finance_memo",
      title: "Financial Memo",
      contentText: "## NexaHealth AI - Financial Model\n\n### Revenue Model\nSaaS + Implementation Services\n- Enterprise: $200K-500K ARR\n- Mid-market: $50K-150K ARR\n\n### Seed Round\n$3.5M at $15M post-money\n24 months runway\n\n*Full financial model pending worker loop implementation*",
    },
  ]);
}
