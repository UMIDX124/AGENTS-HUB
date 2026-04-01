// AI Provider configuration — user selects in Settings, stored in cookie
export type AIProvider = "github" | "openrouter" | "claude";

export const AI_PROVIDERS: Record<AIProvider, {
  name: string;
  description: string;
  models: string[];
  color: string;
  badge: string;
  endpoint: string;
}> = {
  github: {
    name: "GitHub Models",
    description: "GPT-5, DeepSeek V3, Llama 4 — Free via GitHub PAT",
    models: ["openai/gpt-5", "deepseek/DeepSeek-V3-0324", "meta/Llama-4-Scout-17B-16E-Instruct"],
    color: "#34d399",
    badge: "FREE",
    endpoint: "https://models.github.ai/inference/chat/completions",
  },
  openrouter: {
    name: "OpenRouter",
    description: "Nemotron, Qwen 3.6, GPT-OSS — Free tier",
    models: ["nvidia/nemotron-3-super:free", "qwen/qwen-3.6-plus-preview:free", "openai/gpt-oss-120b:free"],
    color: "#818cf8",
    badge: "FREE",
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
  },
  claude: {
    name: "Claude (Anthropic)",
    description: "Claude Sonnet 4.6 — Best quality, paid",
    models: ["claude-sonnet-4-20250514"],
    color: "#fbbf24",
    badge: "PREMIUM",
    endpoint: "https://api.anthropic.com/v1/messages",
  },
};

export async function callAI(
  provider: AIProvider,
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const config = AI_PROVIDERS[provider];
  let lastError = "";

  if (provider === "claude") {
    return callClaude(systemPrompt, userMessage);
  }

  for (const model of config.models) {
    try {
      const text = provider === "github"
        ? await callGitHub(model, systemPrompt, userMessage)
        : await callOpenRouter(model, systemPrompt, userMessage);
      if (text) return text;
    } catch (err: any) {
      lastError = err.message;
      continue;
    }
  }

  throw new Error(`All ${config.name} models failed: ${lastError}`);
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
        { role: "system", content: system + "\n\nIMPORTANT: Output ONLY the requested content. No conversational phrases." },
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
      "HTTP-Referer": process.env.NEXTAUTH_URL || "https://agents-hub-fawn.vercel.app",
      "X-Title": "SEO Agents Hub",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system + "\n\nIMPORTANT: Output ONLY the requested content. No conversational phrases." },
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
  if (!key) throw new Error("ANTHROPIC_API_KEY not set");

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
      system: system + "\n\nIMPORTANT: Output ONLY the requested content. No conversational phrases.",
      messages: [{ role: "user", content: user }],
    }),
  });

  if (!res.ok) throw new Error(`Claude: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.content?.[0]?.text || "";
}
