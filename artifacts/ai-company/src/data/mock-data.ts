import type { TranscriptMessage, Run, Artifact } from "@workspace/api-client-react";

export const MOCK_RUN: Run = {
  id: "run_alpha_77X",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: "active",
  phase: "founder",
  userKeywords: "healthcare, ai, analytics",
  companyName: "NexaHealth AI",
  companyTagline: "AI-Powered Healthcare Analytics for Better Patient Outcomes",
  selectedIdeaTitle: "NexaHealth AI Platform",
  selectedIdeaSummary: "An AI-powered healthcare analytics platform that helps hospitals and clinics predict patient outcomes, optimize treatment plans, and reduce readmission rates using machine learning on EHR data.",
  winnerAgentKey: "tech"
};

export const MOCK_SEQUENCE: TranscriptMessage[] = [
  { id: 'msg_1', runId: 'run_alpha_77X', phase: 'setup', agentKey: 'system', roleType: 'system', messageType: 'system', content: 'Company run initialized. Starting founder debate...', sortOrder: 1 },
  { id: 'msg_2', runId: 'run_alpha_77X', phase: 'founders', agentKey: 'tech', roleType: 'founder', messageType: 'idea', content: 'I propose we build NexaHealth AI - an ML platform that integrates with existing EHR systems to predict patient deterioration 24-48 hours before it happens. We can use transformer models fine-tuned on clinical data. The technical moat is in the model architecture and our data pipeline that handles HIPAA-compliant data processing in real-time.', sortOrder: 2 },
  { id: 'msg_3', runId: 'run_alpha_77X', phase: 'founders', agentKey: 'market', roleType: 'founder', messageType: 'analysis', content: 'The healthcare AI market is projected to reach $45B by 2030. Hospital systems are desperate for solutions that reduce readmission penalties - each readmission costs hospitals $15K-$25K. I see a clear B2B enterprise play targeting the top 200 hospital systems first.', sortOrder: 3 },
  { id: 'msg_4', runId: 'run_alpha_77X', phase: 'founders', agentKey: 'skeptic', roleType: 'founder', messageType: 'critique', content: 'Hold on - healthcare AI is a graveyard of failed startups. The sales cycle is 12-18 months, regulatory burden is enormous, and hospitals are notoriously slow adopters. How do we survive the long sales cycle? What about FDA clearance for clinical decision support?', sortOrder: 4 },
  { id: 'msg_5', runId: 'run_alpha_77X', phase: 'founders', agentKey: 'finance', roleType: 'founder', messageType: 'analysis', content: 'Let me run the numbers. If we target enterprise contracts at $200K-500K ARR per hospital system, we need 20 customers to hit $5M ARR. With a 15-month sales cycle, we need $3M seed to get to first revenue. I recommend a $3.5M seed round with 24 months runway.', sortOrder: 5 },
  { id: 'msg_6', runId: 'run_alpha_77X', phase: 'founders', agentKey: 'tech', roleType: 'founder', messageType: 'response', content: 'Great points from the skeptic. For FDA, we start as a clinical decision *support* tool (not diagnostic), which puts us in Class II - much faster clearance. For data access, we partner with 2-3 academic medical centers who get free access in exchange for anonymized training data.', sortOrder: 6 },
  { id: 'msg_7', runId: 'run_alpha_77X', phase: 'founders', agentKey: 'system', roleType: 'system', messageType: 'decision', content: 'Consensus reached. The founders have agreed on NexaHealth AI. Moving to worker phase for deliverable generation.', sortOrder: 7 },
  { id: 'msg_8', runId: 'run_alpha_77X', phase: 'workers', agentKey: 'system', roleType: 'system', messageType: 'phase_start', content: 'Worker phase initiated. Specialist agents are generating deliverables...', sortOrder: 8 },
  { id: 'msg_9', runId: 'run_alpha_77X', phase: 'workers', agentKey: 'builder', roleType: 'worker', messageType: 'artifact', content: 'Drafting Product Requirements Document and technical architecture...', sortOrder: 9 },
  { id: 'msg_10', runId: 'run_alpha_77X', phase: 'workers', agentKey: 'finance_ops', roleType: 'worker', messageType: 'artifact', content: 'Building 3-year pro-forma financial model and unit economics breakdown...', sortOrder: 10 },
  { id: 'msg_11', runId: 'run_alpha_77X', phase: 'workers', agentKey: 'system', roleType: 'system', messageType: 'decision', content: 'All deliverables generated. Company ready for review.', sortOrder: 11 },
];

export const MOCK_ARTIFACTS: Artifact[] = [
  {
    id: "art_1", runId: "run_alpha_77X", artifactType: "product", title: "Technical Architecture Spec",
    contentText: "# NexaHealth AI - System Architecture\n\n## Overview\nAn AI-powered healthcare analytics platform built on modern cloud infrastructure.\n\n## Core Components\n1. **EHR Integration Layer** - FHIR-compatible APIs for hospital system connectivity\n2. **ML Pipeline** - Transformer models fine-tuned on clinical data for patient risk scoring\n3. **Clinical Dashboard** - Real-time risk alerts and care team collaboration tools\n4. **Alert Engine** - Automated notifications for high-risk patient deterioration\n\n## Tech Stack\n- Backend: Python/FastAPI with async processing\n- ML: PyTorch + HuggingFace Transformers\n- Infrastructure: AWS (HIPAA-compliant)\n- Frontend: React + TypeScript"
  },
  {
    id: "art_2", runId: "run_alpha_77X", artifactType: "gtm", title: "Go-To-Market Strategy",
    contentText: "# GTM Plan\n\n## Phase 1: Academic Partnerships (Months 1-4)\n- Partner with 3 academic medical centers\n- Free pilot program with guaranteed outcome metrics\n- Build clinical evidence and case studies\n\n## Phase 2: Enterprise Sales (Months 5-12)\n- Target top 200 US hospital systems by bed count\n- Conference presence at HIMSS and HLTH\n- Enterprise contracts: $200K-500K ARR\n\n## Phase 3: Mid-Market Expansion (Year 2)\n- Self-serve onboarding for smaller clinics\n- Channel partnerships with EHR vendors"
  },
  {
    id: "art_3", runId: "run_alpha_77X", artifactType: "finance", title: "Financial Projections",
    contentText: "# Financial Model\n\n## Seed Round\n- **Raise:** $3.5M at $15M post-money\n- **Runway:** 24 months\n\n## Year 1 Projections\n- Monthly Burn: $145K\n  - Engineering (4 FTEs): $80K\n  - Cloud/Infrastructure: $25K\n  - Sales & Marketing: $25K\n  - Operations/Legal: $15K\n- Target ARR: $2M (8 enterprise customers)\n- Gross Margin: 82%\n\n## Key Metrics\n- CAC: $45K | LTV: $600K | LTV/CAC: 13.3x\n- Payback Period: 5 months"
  }
];

export const AGENT_PROFILES: Record<string, { name: string; model: string; color: string; border: string; text: string; bg: string; shadow: string }> = {
  tech: { name: "Tech CEO", model: "Claude Sonnet 4", color: "agent-tech", border: "border-agent-tech", text: "text-agent-tech", bg: "bg-agent-tech", shadow: "shadow-agent-tech" },
  market: { name: "Market CEO", model: "GPT-4o", color: "agent-market", border: "border-agent-market", text: "text-agent-market", bg: "bg-agent-market", shadow: "shadow-agent-market" },
  skeptic: { name: "Skeptic CEO", model: "Gemini 2.5 Flash", color: "agent-skeptic", border: "border-agent-skeptic", text: "text-agent-skeptic", bg: "bg-agent-skeptic", shadow: "shadow-agent-skeptic" },
  finance: { name: "Finance CEO", model: "Claude Sonnet 4", color: "agent-finance", border: "border-agent-finance", text: "text-agent-finance", bg: "bg-agent-finance", shadow: "shadow-agent-finance" },
  system: { name: "System Control", model: "kernel", color: "agent-system", border: "border-agent-system", text: "text-agent-system", bg: "bg-agent-system", shadow: "shadow-agent-system" },
  builder: { name: "Builder", model: "Claude Sonnet 4", color: "agent-tech", border: "border-agent-tech", text: "text-agent-tech", bg: "bg-agent-tech", shadow: "shadow-agent-tech" },
  gtm: { name: "GTM Strategist", model: "GPT-4o", color: "agent-market", border: "border-agent-market", text: "text-agent-market", bg: "bg-agent-market", shadow: "shadow-agent-market" },
  finance_ops: { name: "Finance Ops", model: "Gemini 2.5 Flash", color: "agent-finance", border: "border-agent-finance", text: "text-agent-finance", bg: "bg-agent-finance", shadow: "shadow-agent-finance" },
};
