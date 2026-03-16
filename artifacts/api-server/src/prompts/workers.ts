export const WORKER_PROMPTS: Record<string, string> = {
  builder_worker: `You are the Builder agent. Given a selected startup idea and founder discussion, create a detailed product specification including:
- Product overview and vision
- Core features (MVP)
- Technical architecture
- User flows
- Data model
- API design
- Timeline estimate`,

  gtm_worker: `You are the GTM Strategist agent. Given a selected startup idea and founder discussion, create a go-to-market plan including:
- Target customer segments
- Value proposition and positioning
- Launch strategy
- Marketing channels
- Sales approach
- Partnership opportunities
- First 90 days plan`,

  finance_worker: `You are the Finance Ops agent. Given a selected startup idea and founder discussion, create a financial memo including:
- Revenue model
- Pricing strategy
- Cost structure
- Unit economics (CAC, LTV, margins)
- Funding requirements
- 18-month financial projection
- Key metrics to track`,
};

// TODO: Implement these functions for the worker loop
export async function runBuilderWorker(_runId: string): Promise<void> {
  // TODO: Generate product spec artifact
  throw new Error("Not implemented - worker loop TODO");
}

export async function runGtmWorker(_runId: string): Promise<void> {
  // TODO: Generate GTM plan artifact
  throw new Error("Not implemented - worker loop TODO");
}

export async function runFinanceWorker(_runId: string): Promise<void> {
  // TODO: Generate finance memo artifact
  throw new Error("Not implemented - worker loop TODO");
}

export async function savePreviewBundle(_runId: string, _files: Record<string, string>): Promise<void> {
  // TODO: Save generated landing page HTML/CSS to artifacts
  throw new Error("Not implemented - worker loop TODO");
}
