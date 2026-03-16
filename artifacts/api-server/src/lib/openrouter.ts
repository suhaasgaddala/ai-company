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

export interface ChatCompletionOptions {
  jsonSchema?: Record<string, unknown>;
}

export async function chatCompletion(
  model: string,
  messages: ChatMessage[],
  maxTokens: number = 1024,
  options?: ChatCompletionOptions
): Promise<ChatCompletionResult> {
  if (!env.OPENROUTER_API_KEY) {
    return { success: false, error: "OPENROUTER_API_KEY not set" };
  }

  const result = await callOpenRouter(model, messages, maxTokens, options);
  return result;
}

export async function chatCompletionJSON<T>(
  model: string,
  messages: ChatMessage[],
  maxTokens: number = 1024,
  options?: ChatCompletionOptions
): Promise<{ success: boolean; data?: T; raw?: string; error?: string }> {
  const result = await callOpenRouter(model, messages, maxTokens, options);
  if (!result.success || !result.text) {
    return { success: false, error: result.error || "No response text" };
  }

  const parsed = tryParseJSON<T>(result.text);
  if (parsed !== null) {
    return { success: true, data: parsed, raw: result.text };
  }

  const retryMessages: ChatMessage[] = [
    ...messages,
    { role: "assistant", content: result.text },
    { role: "user", content: "Your previous response was not valid JSON. Return ONLY valid JSON matching the requested schema, with no markdown fences, no commentary, and no extra text." },
  ];

  const retryResult = await callOpenRouter(model, retryMessages, maxTokens, options);
  if (!retryResult.success || !retryResult.text) {
    return { success: false, error: "Retry failed: " + (retryResult.error || "No response") };
  }

  const retryParsed = tryParseJSON<T>(retryResult.text);
  if (retryParsed !== null) {
    return { success: true, data: retryParsed, raw: retryResult.text };
  }

  return { success: false, error: "Failed to parse JSON after retry", raw: retryResult.text };
}

function tryParseJSON<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1].trim()) as T;
      } catch {
        // fall through
      }
    }
    const braceMatch = text.match(/\{[\s\S]*\}/);
    if (braceMatch) {
      try {
        return JSON.parse(braceMatch[0]) as T;
      } catch {
        // fall through
      }
    }
    return null;
  }
}

async function callOpenRouter(
  model: string,
  messages: ChatMessage[],
  maxTokens: number,
  options?: ChatCompletionOptions
): Promise<ChatCompletionResult> {
  try {
    const body: Record<string, unknown> = {
      model,
      messages,
      max_tokens: maxTokens,
    };

    if (options?.jsonSchema) {
      const jsonSupportedPrefixes = ["openai/", "google/", "anthropic/"];
      const modelSupportsJsonMode = jsonSupportedPrefixes.some(p => model.startsWith(p));

      if (modelSupportsJsonMode) {
        const hasSchemaContent = Object.keys(options.jsonSchema).length > 0;
        if (hasSchemaContent) {
          body.response_format = {
            type: "json_schema",
            json_schema: { name: "response", schema: options.jsonSchema },
          };
        } else {
          body.response_format = { type: "json_object" };
        }
      }
    }

    const response = await fetch(`${env.OPENROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        ...(env.OPENROUTER_SITE_URL && { "HTTP-Referer": env.OPENROUTER_SITE_URL }),
        ...(env.OPENROUTER_APP_NAME && { "X-Title": env.OPENROUTER_APP_NAME }),
      },
      body: JSON.stringify(body),
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
