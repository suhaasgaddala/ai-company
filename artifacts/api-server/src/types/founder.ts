export type FounderId = "tech" | "market" | "skeptic" | "finance";

export interface Proposal {
  proposalId: string;
  founderId: FounderId;
  companyName: string;
  tagline: string;
  problem: string;
  solution: string;
  targetMarket: string;
  whyNow: string;
  moat: string;
}

export interface Critique {
  critiqueId: string;
  reviewerId: FounderId;
  targetProposalId: string;
  targetFounderId: FounderId;
  strengths: string[];
  weaknesses: string[];
  score: number;
  verdict: string;
}

export interface RevisedProposal {
  proposalId: string;
  founderId: FounderId;
  companyName: string;
  tagline: string;
  problem: string;
  solution: string;
  targetMarket: string;
  whyNow: string;
  moat: string;
  revisionNotes: string;
}

export interface Vote {
  voterId: FounderId;
  selectedProposalId: string;
  selectedFounderId: FounderId;
  rationale: string;
}

export interface Roles {
  ceo: FounderId;
  cto: FounderId;
  cfo: FounderId;
  coo: FounderId;
  cmo: FounderId;
}

export interface CanonicalBrief {
  companyName: string;
  tagline: string;
  problem: string;
  solution: string;
  targetMarket: string;
  businessModel: string;
  whyNow: string;
  moat: string;
  keyMetrics: string[];
  milestones: string[];
}

export interface FounderResult {
  proposals: Proposal[];
  critiques: Critique[];
  revisedProposals: RevisedProposal[];
  votes: Vote[];
  selectedProposal: RevisedProposal;
  roles: Roles;
  canonicalBrief: CanonicalBrief;
}
