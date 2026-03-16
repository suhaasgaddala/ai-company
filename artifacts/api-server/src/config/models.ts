export interface ModelDef {
  id: string;
  provider: string;
  displayName: string;
  maxTokens: number;
}

export const MODELS: Record<string, ModelDef> = {
  "anthropic/claude-sonnet-4": {
    id: "anthropic/claude-sonnet-4",
    provider: "anthropic",
    displayName: "Claude Sonnet 4",
    maxTokens: 4096,
  },
  "openai/gpt-4o": {
    id: "openai/gpt-4o",
    provider: "openai",
    displayName: "GPT-4o",
    maxTokens: 4096,
  },
  "google/gemini-2.5-flash": {
    id: "google/gemini-2.5-flash",
    provider: "google",
    displayName: "Gemini 2.5 Flash",
    maxTokens: 4096,
  },
};

export function getModel(id: string): ModelDef | undefined {
  return MODELS[id];
}
