import { z } from "zod";

export type AiMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AiCompletionInput = {
  messages: AiMessage[];
  systemPrompt?: string;
};

export type AiCompletionResult = {
  content: string;
  provider: string;
  model: string;
};

export interface AiProvider {
  complete(input: AiCompletionInput): Promise<AiCompletionResult>;
}

export type AiAvailability = { configured: boolean; provider?: string; model?: string };

export class AiConfigurationError extends Error {}
export class AiProviderError extends Error {}

type AiConfiguration = {
  provider: string;
  apiKey: string;
  model: string;
  baseUrl: string;
};

function configurationFromEnvironment(): AiConfiguration | null {
  const provider = process.env.AI_PROVIDER?.trim();
  const apiKey = process.env.AI_API_KEY?.trim();
  const model = process.env.AI_MODEL?.trim();
  const baseUrl = process.env.AI_BASE_URL?.trim();

  if (!provider || !apiKey || !model || !baseUrl) return null;

  try {
    const url = new URL(baseUrl);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  } catch {
    return null;
  }

  return { provider, apiKey, model, baseUrl };
}

class OpenAiCompatibleProvider implements AiProvider {
  constructor(private readonly configuration: AiConfiguration) {}

  async complete(input: AiCompletionInput): Promise<AiCompletionResult> {
    let response: Response;
    try {
      response = await fetch(
        new URL("chat/completions", `${this.configuration.baseUrl.replace(/\/+$/, "")}/`),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.configuration.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: this.configuration.model,
            messages: [
              ...(input.systemPrompt ? [{ role: "system", content: input.systemPrompt }] : []),
              ...input.messages,
            ],
            temperature: 0.2,
          }),
          signal: AbortSignal.timeout(30_000),
        },
      );
    } catch {
      throw new AiProviderError("AI provider request failed.");
    }

    if (!response.ok) throw new AiProviderError("AI provider request failed.");

    const parsed = z.object({
      choices: z.array(z.object({ message: z.object({ content: z.string() }) })).min(1),
    }).safeParse(await response.json().catch(() => null));
    const content = parsed.success ? parsed.data.choices[0]?.message.content.trim() : "";
    if (!content) throw new AiProviderError("AI provider returned an invalid response.");

    return {
      content,
      provider: this.configuration.provider,
      model: this.configuration.model,
    };
  }
}

export function aiProviderForEnvironment(): AiProvider {
  const configuration = configurationFromEnvironment();
  if (!configuration) {
    throw new AiConfigurationError("AI assistant is unavailable. Configure AI_PROVIDER, AI_API_KEY, AI_MODEL, and AI_BASE_URL to enable it.");
  }
  if (configuration.provider.toLowerCase() !== "openai-compatible") {
    throw new AiConfigurationError("The configured AI provider does not have an installed adapter.");
  }
  return new OpenAiCompatibleProvider(configuration);
}

export function aiAvailability(): AiAvailability {
  const configuration = configurationFromEnvironment();
  if (!configuration || configuration.provider.toLowerCase() !== "openai-compatible") {
    return { configured: false };
  }
  return { configured: true, provider: configuration.provider, model: configuration.model };
}

export function requireAiConfiguration() {
  return aiProviderForEnvironment();
}
