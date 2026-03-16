export interface ModelDef {
  id: string;
  provider: string;
  displayName: string;
  maxTokens: number;
}

export const MODELS: Record<string, ModelDef> = {
  "openai/gpt-5.4": {
    id: "openai/gpt-5.4",
    provider: "openai",
    displayName: "GPT-5.4",
    maxTokens: 4096,
  },
  "anthropic/claude-sonnet-4.6": {
    id: "anthropic/claude-sonnet-4.6",
    provider: "anthropic",
    displayName: "Claude Sonnet 4.6",
    maxTokens: 4096,
  },
  "google/gemini-3.1-pro-preview": {
    id: "google/gemini-3.1-pro-preview",
    provider: "google",
    displayName: "Gemini 3.1 Pro",
    maxTokens: 4096,
  },
  "x-ai/grok-4.20-beta": {
    id: "x-ai/grok-4.20-beta",
    provider: "x-ai",
    displayName: "Grok 4.20 Beta",
    maxTokens: 4096,
  },
};

export function getModel(id: string): ModelDef | undefined {
  return MODELS[id];
}
