export interface AgentDef {
  key: string;
  displayName: string;
  roleType: "founder" | "worker" | "system";
  defaultModel: string;
  color: string;
  description: string;
  avatar: string;
  promptKey: string;
}

export const FOUNDERS: AgentDef[] = [
  {
    key: "tech",
    displayName: "Tech CEO",
    roleType: "founder",
    defaultModel: "anthropic/claude-sonnet-4",
    color: "#06b6d4",
    description: "Focuses on technical feasibility, architecture, and engineering talent needed",
    avatar: "T",
    promptKey: "tech_founder",
  },
  {
    key: "market",
    displayName: "Market CEO",
    roleType: "founder",
    defaultModel: "openai/gpt-4o",
    color: "#10b981",
    description: "Analyzes market opportunity, competition, go-to-market strategy, and user acquisition",
    avatar: "M",
    promptKey: "market_founder",
  },
  {
    key: "skeptic",
    displayName: "Skeptic CEO",
    roleType: "founder",
    defaultModel: "google/gemini-2.5-flash",
    color: "#f59e0b",
    description: "Challenges assumptions, identifies risks, and stress-tests business viability",
    avatar: "S",
    promptKey: "skeptic_founder",
  },
  {
    key: "finance",
    displayName: "Finance CEO",
    roleType: "founder",
    defaultModel: "anthropic/claude-sonnet-4",
    color: "#8b5cf6",
    description: "Models revenue, costs, funding needs, and path to profitability",
    avatar: "F",
    promptKey: "finance_founder",
  },
];

export const WORKERS: AgentDef[] = [
  {
    key: "builder",
    displayName: "Builder",
    roleType: "worker",
    defaultModel: "anthropic/claude-sonnet-4",
    color: "#3b82f6",
    description: "Generates the product specification and technical architecture",
    avatar: "B",
    promptKey: "builder_worker",
  },
  {
    key: "gtm",
    displayName: "GTM Strategist",
    roleType: "worker",
    defaultModel: "openai/gpt-4o",
    color: "#059669",
    description: "Creates go-to-market plan, positioning, and launch strategy",
    avatar: "G",
    promptKey: "gtm_worker",
  },
  {
    key: "finance_ops",
    displayName: "Finance Ops",
    roleType: "worker",
    defaultModel: "google/gemini-2.5-flash",
    color: "#7c3aed",
    description: "Builds financial model, projections, and funding memo",
    avatar: "$",
    promptKey: "finance_worker",
  },
];

export const ALL_AGENTS = [...FOUNDERS, ...WORKERS];

export function getAgent(key: string): AgentDef | undefined {
  return ALL_AGENTS.find((a) => a.key === key);
}
