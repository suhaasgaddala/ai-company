import { env } from "../config/env.js";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionResult {
  success: boolean;
  model?: string;
  text?: string;
  error?: string;
}

export async function chatCompletion(
  model: string,
  messages: ChatMessage[],
  maxTokens: number = 1024
): Promise<ChatCompletionResult> {
  if (!env.OPENROUTER_API_KEY) {
    return { success: false, error: "OPENROUTER_API_KEY not set" };
  }

  try {
    const response = await fetch(`${env.OPENROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        ...(env.OPENROUTER_SITE_URL && { "HTTP-Referer": env.OPENROUTER_SITE_URL }),
        ...(env.OPENROUTER_APP_NAME && { "X-Title": env.OPENROUTER_APP_NAME }),
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `OpenRouter API error: ${response.status} ${errorText}` };
    }

    const data = await response.json() as any;
    const text = data.choices?.[0]?.message?.content || "";
    return { success: true, model: data.model || model, text };
  } catch (err: any) {
    return { success: false, error: err.message || "Unknown error" };
  }
}
