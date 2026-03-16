import type { FounderId, Proposal, Critique, RevisedProposal } from "../types/founder.js";

const PERSONA: Record<FounderId, { title: string; priorities: string }> = {
  tech: {
    title: "Tech Founder",
    priorities: "technical defensibility, engineering feasibility, architecture scalability, build-vs-buy, and time-to-MVP",
  },
  market: {
    title: "Market Founder",
    priorities: "ideal customer profile (ICP), distribution channels, TAM/SAM/SOM sizing, competitive positioning, and go-to-market wedge",
  },
  skeptic: {
    title: "Skeptic Founder",
    priorities: "hidden assumptions, failure modes, market-timing risk, regulatory exposure, and stress-testing every claim",
  },
  finance: {
    title: "Finance Founder",
    priorities: "unit economics (CAC, LTV, gross margin), pricing strategy, funding requirements, path to profitability, and capital efficiency",
  },
};

export function buildProposalPrompt(founderId: FounderId, keywords: string): { system: string; user: string } {
  const p = PERSONA[founderId];
  return {
    system: `You are the ${p.title} of a venture-backed startup founding team. Your evaluation lens focuses on ${p.priorities}. You produce venture-quality analysis.

You MUST respond with ONLY a JSON object matching this exact schema (no markdown, no commentary):
{
  "proposalId": "<${founderId}_proposal>",
  "founderId": "${founderId}",
  "companyName": "<creative company name>",
  "tagline": "<one-line tagline>",
  "problem": "<2-3 sentences describing the problem>",
  "solution": "<2-3 sentences describing the solution>",
  "targetMarket": "<specific target market and sizing>",
  "whyNow": "<why this opportunity exists now>",
  "moat": "<sustainable competitive advantage>"
}`,
    user: `We are founding a startup. The keywords/theme are: "${keywords}". Propose a specific, venture-scale startup idea from your perspective as the ${p.title}. Be concrete and ambitious.`,
  };
}

export function buildCritiquePrompt(
  reviewerId: FounderId,
  targetProposal: Proposal
): { system: string; user: string } {
  const p = PERSONA[reviewerId];
  return {
    system: `You are the ${p.title}. Your evaluation lens focuses on ${p.priorities}. You are critiquing a fellow founder's startup proposal. Be rigorous but constructive.

You MUST respond with ONLY a JSON object matching this exact schema (no markdown, no commentary):
{
  "critiqueId": "<${reviewerId}_critiques_${targetProposal.founderId}>",
  "reviewerId": "${reviewerId}",
  "targetProposalId": "${targetProposal.proposalId}",
  "targetFounderId": "${targetProposal.founderId}",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "score": <1-10 integer>,
  "verdict": "<2-3 sentence overall assessment>"
}`,
    user: `Critique this startup proposal from ${PERSONA[targetProposal.founderId].title}:

Company: ${targetProposal.companyName} — "${targetProposal.tagline}"
Problem: ${targetProposal.problem}
Solution: ${targetProposal.solution}
Target Market: ${targetProposal.targetMarket}
Why Now: ${targetProposal.whyNow}
Moat: ${targetProposal.moat}

Evaluate from your perspective as the ${p.title}. Score 1-10.`,
  };
}

export function buildRevisionPrompt(
  founderId: FounderId,
  originalProposal: Proposal,
  critiques: Critique[]
): { system: string; user: string } {
  const p = PERSONA[founderId];
  const critiqueText = critiques
    .map(c => `[${PERSONA[c.reviewerId].title} — Score ${c.score}/10]\nStrengths: ${c.strengths.join("; ")}\nWeaknesses: ${c.weaknesses.join("; ")}\nVerdict: ${c.verdict}`)
    .join("\n\n");

  return {
    system: `You are the ${p.title}. You are revising your original startup proposal based on critiques from the other founders. You MUST keep the same core idea (same company name and fundamental concept) but strengthen it by addressing the feedback. Do NOT pivot to a different idea.

You MUST respond with ONLY a JSON object matching this exact schema (no markdown, no commentary):
{
  "proposalId": "${originalProposal.proposalId}",
  "founderId": "${founderId}",
  "companyName": "${originalProposal.companyName}",
  "tagline": "<improved tagline>",
  "problem": "<refined problem statement>",
  "solution": "<refined solution addressing critiques>",
  "targetMarket": "<refined target market>",
  "whyNow": "<refined timing argument>",
  "moat": "<strengthened competitive advantage>",
  "revisionNotes": "<brief summary of what you changed and why>"
}`,
    user: `Here is your original proposal:

Company: ${originalProposal.companyName} — "${originalProposal.tagline}"
Problem: ${originalProposal.problem}
Solution: ${originalProposal.solution}
Target Market: ${originalProposal.targetMarket}
Why Now: ${originalProposal.whyNow}
Moat: ${originalProposal.moat}

Here are the critiques you received:

${critiqueText}

Revise your proposal to address the weaknesses while preserving the core idea. Keep the company name "${originalProposal.companyName}".`,
  };
}

export function buildVotePrompt(
  voterId: FounderId,
  revisedProposals: RevisedProposal[]
): { system: string; user: string } {
  const p = PERSONA[voterId];
  const otherProposals = revisedProposals.filter(rp => rp.founderId !== voterId);
  const proposalText = otherProposals
    .map(rp => `[${PERSONA[rp.founderId].title} — ${rp.companyName}]\nTagline: ${rp.tagline}\nProblem: ${rp.problem}\nSolution: ${rp.solution}\nTarget Market: ${rp.targetMarket}\nWhy Now: ${rp.whyNow}\nMoat: ${rp.moat}`)
    .join("\n\n---\n\n");

  return {
    system: `You are the ${p.title}. You are voting for the best startup proposal. You CANNOT vote for your own proposal. Evaluate from your perspective focusing on ${p.priorities}.

You MUST respond with ONLY a JSON object matching this exact schema (no markdown, no commentary):
{
  "voterId": "${voterId}",
  "selectedProposalId": "<proposalId of the proposal you vote for>",
  "selectedFounderId": "<founderId of the proposal you vote for>",
  "rationale": "<2-3 sentences explaining your vote>"
}`,
    user: `Vote for the best startup proposal (you cannot vote for your own). Here are the other founders' revised proposals:

${proposalText}

Which proposal has the highest chance of building a venture-scale business? Vote for exactly one.`,
  };
}

export function buildCanonicalBriefPrompt(
  winningProposal: RevisedProposal,
  allCritiques: Critique[],
  allProposals: RevisedProposal[]
): { system: string; user: string } {
  const relevantCritiques = allCritiques
    .filter(c => c.targetFounderId === winningProposal.founderId)
    .map(c => `[${PERSONA[c.reviewerId].title}]: ${c.verdict}`)
    .join("\n");

  const otherInsights = allProposals
    .filter(p => p.founderId !== winningProposal.founderId)
    .map(p => `[${PERSONA[p.founderId].title}]: Moat — ${p.moat}; Market — ${p.targetMarket}`)
    .join("\n");

  return {
    system: `You are a venture strategist synthesizing a canonical company brief from a winning startup proposal and multi-founder debate. Produce a comprehensive, investor-ready brief.

You MUST respond with ONLY a JSON object matching this exact schema (no markdown, no commentary):
{
  "companyName": "<company name>",
  "tagline": "<tagline>",
  "problem": "<comprehensive problem statement>",
  "solution": "<comprehensive solution description>",
  "targetMarket": "<detailed target market with sizing>",
  "businessModel": "<revenue model and pricing>",
  "whyNow": "<market timing thesis>",
  "moat": "<sustainable competitive advantages>",
  "keyMetrics": ["<metric 1>", "<metric 2>", "<metric 3>", "<metric 4>", "<metric 5>"],
  "milestones": ["<6-month milestone>", "<12-month milestone>", "<18-month milestone>", "<24-month milestone>"]
}`,
    user: `Synthesize a canonical company brief from this winning proposal:

Company: ${winningProposal.companyName} — "${winningProposal.tagline}"
Problem: ${winningProposal.problem}
Solution: ${winningProposal.solution}
Target Market: ${winningProposal.targetMarket}
Why Now: ${winningProposal.whyNow}
Moat: ${winningProposal.moat}

Critiques received:
${relevantCritiques}

Insights from other founders' proposals:
${otherInsights}

Create a comprehensive, investor-ready brief.`,
  };
}
