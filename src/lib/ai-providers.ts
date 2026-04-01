// AI Provider configuration
export type AIProvider = "gemini" | "github" | "openrouter" | "claude";

export const AI_PROVIDERS: Record<AIProvider, {
  name: string;
  models: string[];
  color: string;
  badge: string;
}> = {
  gemini: {
    name: "Gemini",
    models: ["gemini-2.5-flash", "gemini-3.1-flash-lite", "gemini-3-flash"],
    color: "#4285f4",
    badge: "FREE",
  },
  github: {
    name: "GitHub Models",
    models: ["openai/gpt-4o", "deepseek/DeepSeek-V3-0324", "meta/Llama-4-Scout-17B-16E-Instruct"],
    color: "#34d399",
    badge: "FREE",
  },
  openrouter: {
    name: "OpenRouter",
    models: ["deepseek/deepseek-chat-v3-0324:free", "meta-llama/llama-4-scout:free", "qwen/qwen3-235b-a22b:free"],
    color: "#818cf8",
    badge: "FREE",
  },
  claude: {
    name: "Claude",
    models: ["claude-sonnet-4-20250514"],
    color: "#fbbf24",
    badge: "PAID",
  },
};

// Auto-fallback order
const FALLBACK_ORDER: AIProvider[] = ["gemini", "github", "openrouter"];

export async function callAI(
  provider: AIProvider,
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  if (provider === "claude") {
    return callClaude(systemPrompt, userMessage);
  }

  // Try selected provider first
  try {
    return await callProvider(provider, systemPrompt, userMessage);
  } catch (primaryErr: any) {
    console.warn(`[AI] Primary ${provider} failed: ${primaryErr.message}`);

    // Auto-fallback to other free providers
    for (const fallback of FALLBACK_ORDER) {
      if (fallback === provider) continue;
      try {
        console.log(`[AI] Falling back to ${fallback}...`);
        return await callProvider(fallback, systemPrompt, userMessage);
      } catch (err: any) {
        console.warn(`[AI] Fallback ${fallback} failed: ${err.message}`);
        continue;
      }
    }

    throw new Error("All providers failed. Try again in 1 minute.");
  }
}

async function callProvider(provider: AIProvider, system: string, user: string): Promise<string> {
  const config = AI_PROVIDERS[provider];
  let lastError = "";

  for (const model of config.models) {
    try {
      if (provider === "gemini") return await callGemini(model, system, user);
      if (provider === "github") return await callGitHub(model, system, user);
      return await callOpenRouter(model, system, user);
    } catch (err: any) {
      lastError = err.message;
      continue;
    }
  }

  throw new Error(`All ${config.name} models failed: ${lastError}`);
}

const NO_CHAT = "\n\nIMPORTANT: Output ONLY the requested content. No conversational phrases.";

async function callGemini(model: string, system: string, user: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not set");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system + NO_CHAT }] },
        contents: [{ parts: [{ text: user }] }],
        generationConfig: { maxOutputTokens: 4096, temperature: 0.7 },
      }),
    }
  );

  if (!res.ok) throw new Error(`Gemini ${model}: ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function callGitHub(model: string, system: string, user: string): Promise<string> {
  const token = process.env.GITHUB_MODELS_TOKEN;
  if (!token) throw new Error("GITHUB_MODELS_TOKEN not set");

  const res = await fetch("https://models.github.ai/inference/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "X-GitHub-Api-Version": "2026-03-10",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system + NO_CHAT },
        { role: "user", content: user },
      ],
      max_tokens: 4096,
      temperature: 0.7,
    }),
  });

  if (!res.ok) throw new Error(`GitHub ${model}: ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

async function callOpenRouter(model: string, system: string, user: string): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY not set");

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://agents-hub-fawn.vercel.app",
      "X-Title": "SEO Agents Hub",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system + NO_CHAT },
        { role: "user", content: user },
      ],
      max_tokens: 4096,
      temperature: 0.7,
    }),
  });

  if (!res.ok) throw new Error(`OpenRouter ${model}: ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

async function callClaude(system: string, user: string): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY not set — add credits at console.anthropic.com");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: system + NO_CHAT,
      messages: [{ role: "user", content: user }],
    }),
  });

  if (!res.ok) throw new Error(`Claude: ${res.status}`);
  const data = await res.json();
  return data.content?.[0]?.text || "";
}
