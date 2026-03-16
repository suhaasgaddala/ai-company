import { chatCompletion } from "../lib/openrouter.js";
import { FOUNDERS } from "../config/agents.js";
import { FOUNDER_PROMPTS } from "../prompts/founders.js";
import * as transcriptService from "./transcriptService.js";
import * as runService from "./runService.js";

export async function runFounderPhase(runId: string): Promise<void> {
  const run = await runService.getRun(runId);
  if (!run) throw new Error("Run not found");

  await runService.updateRun(runId, { phase: "founders_ideation", status: "running" });

  let sortOrder = await transcriptService.getNextSortOrder(runId);

  await transcriptService.addTranscriptMessage({
    runId,
    phase: "founders",
    agentKey: "system",
    roleType: "system",
    messageType: "phase_start",
    content: `Founder debate initiated. Analyzing opportunity space: "${run.userKeywords || "general tech startup"}"`,
    sortOrder: sortOrder++,
  });

  const keywords = run.userKeywords || "general tech startup";
  const conversationHistory: { agentKey: string; content: string }[] = [];

  for (const founder of FOUNDERS) {
    const prompt = FOUNDER_PROMPTS[founder.promptKey] || "";
    const priorContext = conversationHistory.length > 0
      ? "\n\nHere is what the other founders have said so far:\n" +
        conversationHistory.map(m => `[${m.agentKey.toUpperCase()}]: ${m.content}`).join("\n\n")
      : "";

    const result = await chatCompletion(founder.defaultModel, [
      { role: "system", content: prompt },
      {
        role: "user",
        content: `We are founding a startup. The keywords/theme are: "${keywords}".${priorContext}\n\nPropose a specific startup idea. Be concise but concrete - include the company name, what it does, target market, and why now. Keep it to 2-3 paragraphs.`,
      },
    ], 600);

    const content = result.success
      ? result.text || "[No response]"
      : `[Error: ${result.error}]`;

    await transcriptService.addTranscriptMessage({
      runId,
      phase: "founders",
      agentKey: founder.key,
      roleType: "founder",
      messageType: "idea",
      content,
      sortOrder: sortOrder++,
    });

    conversationHistory.push({ agentKey: founder.key, content });
  }

  await runService.updateRun(runId, { phase: "founders_critique" });

  await transcriptService.addTranscriptMessage({
    runId,
    phase: "founders",
    agentKey: "system",
    roleType: "system",
    messageType: "system",
    content: "Ideas presented. Founders are now debating and critiquing...",
    sortOrder: sortOrder++,
  });

  const allIdeas = conversationHistory.map(m => `[${m.agentKey.toUpperCase()}]: ${m.content}`).join("\n\n");

  for (const founder of FOUNDERS) {
    const prompt = FOUNDER_PROMPTS[founder.promptKey] || "";

    const result = await chatCompletion(founder.defaultModel, [
      { role: "system", content: prompt },
      {
        role: "user",
        content: `Here are all the startup ideas proposed by our founding team:\n\n${allIdeas}\n\nAs the ${founder.displayName}, critically evaluate these ideas from your perspective. Which idea do you think is strongest and why? What are the key risks? Be direct and concise - 2-3 paragraphs max.`,
      },
    ], 500);

    const content = result.success
      ? result.text || "[No response]"
      : `[Error: ${result.error}]`;

    await transcriptService.addTranscriptMessage({
      runId,
      phase: "founders",
      agentKey: founder.key,
      roleType: "founder",
      messageType: "critique",
      content,
      sortOrder: sortOrder++,
    });
  }

  await runService.updateRun(runId, { phase: "founders_convergence" });

  await transcriptService.addTranscriptMessage({
    runId,
    phase: "founders",
    agentKey: "system",
    roleType: "system",
    messageType: "system",
    content: "Debate complete. Synthesizing consensus...",
    sortOrder: sortOrder++,
  });

  const fullTranscript = (await transcriptService.getTranscript(runId))
    .filter(m => m.roleType === "founder")
    .map(m => `[${(m.agentKey || "unknown").toUpperCase()} - ${m.messageType}]: ${m.content}`)
    .join("\n\n");

  const convergenceResult = await chatCompletion("openai/gpt-5.4", [
    {
      role: "system",
      content: `You are a neutral facilitator. Based on the founder debate below, determine the winning startup idea that has the most support. Respond ONLY in this exact JSON format, no other text:\n{"companyName":"...","companyTagline":"...","selectedIdeaTitle":"...","selectedIdeaSummary":"...","winnerAgentKey":"tech|market|skeptic|finance"}`,
    },
    {
      role: "user",
      content: `Here is the full founder debate:\n\n${fullTranscript}\n\nDetermine the consensus winning idea. Return JSON only.`,
    },
  ], 400);

  let companyData = {
    companyName: "Unnamed Startup",
    companyTagline: "AI-Generated Company",
    selectedIdeaTitle: "TBD",
    selectedIdeaSummary: "Convergence failed",
    winnerAgentKey: "tech",
  };

  if (convergenceResult.success && convergenceResult.text) {
    try {
      const jsonMatch = convergenceResult.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        companyData = { ...companyData, ...parsed };
      }
    } catch {
      console.error("Failed to parse convergence JSON");
    }
  }

  await runService.updateRun(runId, {
    phase: "founders_complete",
    status: "completed",
    companyName: companyData.companyName,
    companyTagline: companyData.companyTagline,
    selectedIdeaTitle: companyData.selectedIdeaTitle,
    selectedIdeaSummary: companyData.selectedIdeaSummary,
    winnerAgentKey: companyData.winnerAgentKey,
  });

  await transcriptService.addTranscriptMessage({
    runId,
    phase: "founders",
    agentKey: "system",
    roleType: "system",
    messageType: "decision",
    content: `Consensus reached: ${companyData.companyName} — "${companyData.companyTagline}". Champion: ${companyData.winnerAgentKey.toUpperCase()} CEO.`,
    sortOrder: sortOrder++,
  });
}
