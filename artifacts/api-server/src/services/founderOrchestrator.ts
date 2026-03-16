import { chatCompletionJSON } from "../lib/openrouter.js";
import { FOUNDERS } from "../config/agents.js";
import {
  buildProposalPrompt,
  buildCritiquePrompt,
  buildRevisionPrompt,
  buildVotePrompt,
  buildCanonicalBriefPrompt,
} from "../prompts/founders.js";
import * as transcriptService from "./transcriptService.js";
import * as runService from "./runService.js";
import * as artifactService from "./artifactService.js";
import type {
  FounderId,
  Proposal,
  Critique,
  RevisedProposal,
  Vote,
  CanonicalBrief,
  Roles,
  FounderResult,
} from "../types/founder.js";

const FOUNDER_IDS: FounderId[] = ["tech", "market", "skeptic", "finance"];

function getFounderDef(id: FounderId) {
  return FOUNDERS.find(f => f.key === id)!;
}

export async function runFounderPhase(runId: string): Promise<void> {
  const run = await runService.getRun(runId);
  if (!run) throw new Error("Run not found");

  const keywords = run.userKeywords || "general tech startup";
  let sortOrder = await transcriptService.getNextSortOrder(runId);

  try {
    await runService.updateRun(runId, { phase: "founders_ideation", status: "running" });

    await transcriptService.addTranscriptMessage({
      runId,
      phase: "proposal",
      agentKey: "system",
      roleType: "system",
      messageType: "phase_start",
      content: `Founder debate initiated. Analyzing opportunity space: "${keywords}"`,
      sortOrder: sortOrder++,
    });

    const stageAResult = await stageA(runId, keywords, sortOrder);
    sortOrder = stageAResult.nextSortOrder;

    await runService.updateRun(runId, { phase: "founders_critique" });
    const stageBResult = await stageB(runId, stageAResult.proposals, sortOrder);
    sortOrder = stageBResult.nextSortOrder;

    await runService.updateRun(runId, { phase: "founders_revision" });
    const stageCResult = await stageC(runId, stageAResult.proposals, stageBResult.critiques, sortOrder);
    sortOrder = stageCResult.nextSortOrder;

    await runService.updateRun(runId, { phase: "founders_voting" });
    const stageDResult = await stageD(runId, stageCResult.revisedProposals, sortOrder);
    sortOrder = stageDResult.nextSortOrder;

    await runService.updateRun(runId, { phase: "founders_decision" });
    const winner = stageE(stageAResult.proposals, stageBResult.critiques, stageCResult.revisedProposals, stageDResult.votes);

    await runService.updateRun(runId, { phase: "founders_synthesis" });
    const stageFResult = await stageF(runId, winner, stageBResult.critiques, stageCResult.revisedProposals, sortOrder);
    sortOrder = stageFResult.nextSortOrder;

    const founderResult: FounderResult = {
      proposals: stageAResult.proposals,
      critiques: stageBResult.critiques,
      revisedProposals: stageCResult.revisedProposals,
      votes: stageDResult.votes,
      selectedProposal: winner,
      roles: stageFResult.roles,
      canonicalBrief: stageFResult.canonicalBrief,
    };

    await artifactService.saveArtifact({
      runId,
      artifactType: "founder_result",
      title: `${stageFResult.canonicalBrief.companyName} — Founder Debate Result`,
      contentText: JSON.stringify(founderResult),
    });

    await runService.updateRun(runId, {
      phase: "founders_complete",
      status: "completed",
      companyName: stageFResult.canonicalBrief.companyName,
      companyTagline: stageFResult.canonicalBrief.tagline,
      selectedIdeaTitle: stageFResult.canonicalBrief.companyName,
      selectedIdeaSummary: stageFResult.canonicalBrief.problem + " " + stageFResult.canonicalBrief.solution,
      winnerAgentKey: winner.founderId,
    });

    const { roles } = stageFResult;
    const roleList = `CEO: ${roles.ceo.toUpperCase()}, CTO: ${roles.cto.toUpperCase()}, CFO: ${roles.cfo.toUpperCase()}, COO: ${roles.coo.toUpperCase()}, CMO: ${roles.cmo.toUpperCase()}`;
    await transcriptService.addTranscriptMessage({
      runId,
      phase: "decision",
      agentKey: "system",
      roleType: "system",
      messageType: "decision",
      content: `Winner selected: ${stageFResult.canonicalBrief.companyName} — "${stageFResult.canonicalBrief.tagline}". Champion: ${winner.founderId.toUpperCase()} → CEO. Roles: ${roleList}`,
      sortOrder: sortOrder++,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Founder phase error:", err);
    await runService.updateRun(runId, { status: "error", phase: "founders_error" });
    await transcriptService.addTranscriptMessage({
      runId,
      phase: "error",
      agentKey: "system",
      roleType: "system",
      messageType: "system",
      content: `Founder debate failed: ${message}`,
      sortOrder: sortOrder++,
    });
  }
}

async function stageA(
  runId: string,
  keywords: string,
  startSort: number
): Promise<{ proposals: Proposal[]; nextSortOrder: number }> {
  const proposals: Proposal[] = [];
  let sortOrder = startSort;

  for (const founderId of FOUNDER_IDS) {
    const def = getFounderDef(founderId);
    const { system, user } = buildProposalPrompt(founderId, keywords);

    const result = await chatCompletionJSON<Proposal>(
      def.defaultModel,
      [{ role: "system", content: system }, { role: "user", content: user }],
      800,
      { jsonSchema: {} }
    );

    if (!result.success || !result.data) {
      throw new Error(`Proposal generation failed for ${founderId}: ${result.error}`);
    }

    const proposal: Proposal = {
      ...result.data,
      proposalId: `${founderId}_proposal`,
      founderId,
    };
    proposals.push(proposal);

    await transcriptService.addTranscriptMessage({
      runId,
      phase: "proposal",
      agentKey: founderId,
      roleType: "founder",
      messageType: "proposal",
      content: JSON.stringify(proposal),
      sortOrder: sortOrder++,
    });
  }

  await artifactService.saveArtifact({
    runId,
    artifactType: "founder_proposals",
    title: "Founder Proposals",
    contentText: JSON.stringify(proposals),
  });

  return { proposals, nextSortOrder: sortOrder };
}

async function stageB(
  runId: string,
  proposals: Proposal[],
  startSort: number
): Promise<{ critiques: Critique[]; nextSortOrder: number }> {
  const critiques: Critique[] = [];
  let sortOrder = startSort;

  await transcriptService.addTranscriptMessage({
    runId,
    phase: "critique",
    agentKey: "system",
    roleType: "system",
    messageType: "phase_start",
    content: "Proposals submitted. Founders are now critiquing each other's ideas...",
    sortOrder: sortOrder++,
  });

  for (const reviewerId of FOUNDER_IDS) {
    const def = getFounderDef(reviewerId);
    const targets = proposals.filter(p => p.founderId !== reviewerId);

    for (const target of targets) {
      const { system, user } = buildCritiquePrompt(reviewerId, target);

      const result = await chatCompletionJSON<Critique>(
        def.defaultModel,
        [{ role: "system", content: system }, { role: "user", content: user }],
        600,
        { jsonSchema: {} }
      );

      if (!result.success || !result.data) {
        throw new Error(`Critique failed for ${reviewerId} → ${target.founderId}: ${result.error}`);
      }

      const critique: Critique = {
        ...result.data,
        critiqueId: `${reviewerId}_critiques_${target.founderId}`,
        reviewerId,
        targetProposalId: target.proposalId,
        targetFounderId: target.founderId,
        score: Math.max(1, Math.min(10, Math.round(Number(result.data.score) || 5))),
      };
      critiques.push(critique);

      await transcriptService.addTranscriptMessage({
        runId,
        phase: "critique",
        agentKey: reviewerId,
        roleType: "founder",
        messageType: "critique",
        content: JSON.stringify(critique),
        sortOrder: sortOrder++,
      });
    }
  }

  await artifactService.saveArtifact({
    runId,
    artifactType: "founder_critiques",
    title: "Founder Critiques",
    contentText: JSON.stringify(critiques),
  });

  return { critiques, nextSortOrder: sortOrder };
}

async function stageC(
  runId: string,
  proposals: Proposal[],
  critiques: Critique[],
  startSort: number
): Promise<{ revisedProposals: RevisedProposal[]; nextSortOrder: number }> {
  const revisedProposals: RevisedProposal[] = [];
  let sortOrder = startSort;

  await transcriptService.addTranscriptMessage({
    runId,
    phase: "revision",
    agentKey: "system",
    roleType: "system",
    messageType: "phase_start",
    content: "Critiques complete. Founders are revising their proposals...",
    sortOrder: sortOrder++,
  });

  for (const founderId of FOUNDER_IDS) {
    const def = getFounderDef(founderId);
    const originalProposal = proposals.find(p => p.founderId === founderId)!;
    const receivedCritiques = critiques.filter(c => c.targetFounderId === founderId);

    const { system, user } = buildRevisionPrompt(founderId, originalProposal, receivedCritiques);

    const result = await chatCompletionJSON<RevisedProposal>(
      def.defaultModel,
      [{ role: "system", content: system }, { role: "user", content: user }],
      800,
      { jsonSchema: {} }
    );

    if (!result.success || !result.data) {
      throw new Error(`Revision failed for ${founderId}: ${result.error}`);
    }

    const revised: RevisedProposal = {
      ...result.data,
      proposalId: originalProposal.proposalId,
      founderId,
    };
    revisedProposals.push(revised);

    await transcriptService.addTranscriptMessage({
      runId,
      phase: "revision",
      agentKey: founderId,
      roleType: "founder",
      messageType: "revision",
      content: JSON.stringify(revised),
      sortOrder: sortOrder++,
    });
  }

  await artifactService.saveArtifact({
    runId,
    artifactType: "founder_revised_proposals",
    title: "Revised Proposals",
    contentText: JSON.stringify(revisedProposals),
  });

  return { revisedProposals, nextSortOrder: sortOrder };
}

async function stageD(
  runId: string,
  revisedProposals: RevisedProposal[],
  startSort: number
): Promise<{ votes: Vote[]; nextSortOrder: number }> {
  const votes: Vote[] = [];
  let sortOrder = startSort;

  await transcriptService.addTranscriptMessage({
    runId,
    phase: "vote",
    agentKey: "system",
    roleType: "system",
    messageType: "phase_start",
    content: "Revisions complete. Founders are casting their votes...",
    sortOrder: sortOrder++,
  });

  for (const voterId of FOUNDER_IDS) {
    const def = getFounderDef(voterId);
    const { system, user } = buildVotePrompt(voterId, revisedProposals);

    const result = await chatCompletionJSON<Vote>(
      def.defaultModel,
      [{ role: "system", content: system }, { role: "user", content: user }],
      400,
      { jsonSchema: {} }
    );

    if (!result.success || !result.data) {
      throw new Error(`Vote failed for ${voterId}: ${result.error}`);
    }

    const vote: Vote = {
      ...result.data,
      voterId,
    };

    if (vote.selectedFounderId === voterId) {
      const validTargets = revisedProposals.filter(rp => rp.founderId !== voterId);
      if (validTargets.length > 0) {
        vote.selectedProposalId = validTargets[0].proposalId;
        vote.selectedFounderId = validTargets[0].founderId;
        vote.rationale = `[Auto-corrected from self-vote] ${vote.rationale}`;
      }
    }

    const validProposalIds = revisedProposals.map(rp => rp.proposalId);
    if (!validProposalIds.includes(vote.selectedProposalId)) {
      const validTargets = revisedProposals.filter(rp => rp.founderId !== voterId);
      if (validTargets.length > 0) {
        vote.selectedProposalId = validTargets[0].proposalId;
        vote.selectedFounderId = validTargets[0].founderId;
        vote.rationale = `[Auto-corrected from invalid proposal] ${vote.rationale}`;
      }
    }

    votes.push(vote);

    await transcriptService.addTranscriptMessage({
      runId,
      phase: "vote",
      agentKey: voterId,
      roleType: "founder",
      messageType: "vote",
      content: JSON.stringify(vote),
      sortOrder: sortOrder++,
    });
  }

  await artifactService.saveArtifact({
    runId,
    artifactType: "founder_votes",
    title: "Founder Votes",
    contentText: JSON.stringify(votes),
  });

  return { votes, nextSortOrder: sortOrder };
}

function stageE(
  proposals: Proposal[],
  critiques: Critique[],
  revisedProposals: RevisedProposal[],
  votes: Vote[]
): RevisedProposal {
  const voteCounts: Record<string, number> = {};
  for (const v of votes) {
    voteCounts[v.selectedProposalId] = (voteCounts[v.selectedProposalId] || 0) + 1;
  }

  const candidates = revisedProposals.map(rp => {
    const voteCount = voteCounts[rp.proposalId] || 0;

    const originalCritiques = critiques.filter(c => c.targetFounderId === rp.founderId);
    const aggregateCritiqueScore = originalCritiques.reduce((sum, c) => sum + (c.score || 0), 0);

    const marketPref = votes.find(v => v.voterId === "market")?.selectedProposalId === rp.proposalId ? 1 : 0;
    const financePref = votes.find(v => v.voterId === "finance")?.selectedProposalId === rp.proposalId ? 1 : 0;

    return { rp, voteCount, aggregateCritiqueScore, marketPref, financePref };
  });

  candidates.sort((a, b) => {
    if (b.voteCount !== a.voteCount) return b.voteCount - a.voteCount;
    if (b.aggregateCritiqueScore !== a.aggregateCritiqueScore) return b.aggregateCritiqueScore - a.aggregateCritiqueScore;
    if (b.marketPref !== a.marketPref) return b.marketPref - a.marketPref;
    if (b.financePref !== a.financePref) return b.financePref - a.financePref;
    return a.rp.proposalId.localeCompare(b.rp.proposalId);
  });

  return candidates[0].rp;
}

async function stageF(
  runId: string,
  winner: RevisedProposal,
  critiques: Critique[],
  revisedProposals: RevisedProposal[],
  startSort: number
): Promise<{ canonicalBrief: CanonicalBrief; roles: Roles; nextSortOrder: number }> {
  let sortOrder = startSort;

  await transcriptService.addTranscriptMessage({
    runId,
    phase: "synthesis",
    agentKey: "system",
    roleType: "system",
    messageType: "phase_start",
    content: `Votes tallied. Winner: ${winner.companyName}. Synthesizing canonical brief...`,
    sortOrder: sortOrder++,
  });

  const { system, user } = buildCanonicalBriefPrompt(winner, critiques, revisedProposals);

  const result = await chatCompletionJSON<CanonicalBrief>(
    "openai/gpt-5.4",
    [{ role: "system", content: system }, { role: "user", content: user }],
    1200,
    { jsonSchema: {} }
  );

  if (!result.success || !result.data) {
    throw new Error(`Canonical brief synthesis failed: ${result.error}`);
  }

  const canonicalBrief = result.data;

  const winnerId = winner.founderId;

  const ROLE_MAP: Record<string, FounderId> = {
    cto: "tech",
    cfo: "finance",
    coo: "skeptic",
    cmo: "market",
  };

  const roles: Roles = {
    ceo: winnerId,
    cto: ROLE_MAP.cto,
    cfo: ROLE_MAP.cfo,
    coo: ROLE_MAP.coo,
    cmo: ROLE_MAP.cmo,
  };

  return { canonicalBrief, roles, nextSortOrder: sortOrder };
}
