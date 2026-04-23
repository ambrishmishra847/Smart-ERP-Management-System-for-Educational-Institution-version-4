const DEFAULT_OPENAI_COMPATIBLE_URL = "https://api.openai.com/v1/responses";
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
const DEFAULT_OPENAI_COMPATIBLE_MODEL = "gpt-4.1-mini";
const DEFAULT_OLLAMA_URL = "http://localhost:11434/v1/chat/completions";
const DEFAULT_OLLAMA_MODEL = "llama3.1";

export const AI_PROVIDER_PRESETS = {
  custom: {
    key: "custom",
    label: "Custom Provider",
    providerType: "openai-compatible",
    providerName: "custom-ai",
    apiUrl: "",
    model: "",
    authHeader: "Authorization",
    authScheme: "Bearer",
    requiresApiKey: true,
  },
  "openai-compatible": {
    key: "openai-compatible",
    label: "OpenAI-Compatible",
    providerType: "openai-compatible",
    providerName: "openai-compatible",
    apiUrl: DEFAULT_OPENAI_COMPATIBLE_URL,
    model: DEFAULT_OPENAI_COMPATIBLE_MODEL,
    authHeader: "Authorization",
    authScheme: "Bearer",
    requiresApiKey: true,
  },
  gemini: {
    key: "gemini",
    label: "Gemini-Compatible",
    providerType: "gemini",
    providerName: "gemini-compatible",
    apiUrl: "",
    model: DEFAULT_GEMINI_MODEL,
    authHeader: "x-goog-api-key",
    authScheme: "",
    requiresApiKey: true,
  },
  ollama: {
    key: "ollama",
    label: "Ollama (Local)",
    providerType: "openai-compatible",
    providerName: "ollama",
    apiUrl: DEFAULT_OLLAMA_URL,
    model: DEFAULT_OLLAMA_MODEL,
    authHeader: "Authorization",
    authScheme: "Bearer",
    requiresApiKey: false,
  },
};

export const getAiProviderPresetList = () =>
  Object.values(AI_PROVIDER_PRESETS).map((preset) => ({
    key: preset.key,
    label: preset.label,
    providerType: preset.providerType,
    providerName: preset.providerName,
    apiUrl: preset.apiUrl,
    model: preset.model,
    authHeader: preset.authHeader,
    authScheme: preset.authScheme,
    requiresApiKey: preset.requiresApiKey,
  }));

const extractJson = (text) => {
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      return null;
    }

    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
};

const buildPrompt = (profile) => `
You are assisting an educational ERP. Analyze the structured student risk data below and return valid JSON only.

Required JSON shape:
{
  "summary": "2-3 sentence summary",
  "keyConcerns": ["concern 1", "concern 2", "concern 3"],
  "interventions": ["action 1", "action 2", "action 3"],
  "parentDraft": "short professional parent message",
  "disclaimer": "one sentence"
}

Rules:
- Be specific and grounded in the provided data.
- Do not invent facts.
- Keep tone supportive and professional.
- Do not make final disciplinary decisions.

Structured data:
${JSON.stringify(profile, null, 2)}
`;

export const getAiConfig = (storedConfig = null) => {
  const preset = storedConfig?.presetKey ? AI_PROVIDER_PRESETS[storedConfig.presetKey] : null;
  const providerType = storedConfig?.providerType || preset?.providerType || process.env.AI_PROVIDER_TYPE || "openai-compatible";
  const apiKey = storedConfig?.apiKey || process.env.AI_API_KEY || process.env.OPENAI_API_KEY || "";
  const model = storedConfig?.model || preset?.model || process.env.AI_MODEL || process.env.OPENAI_MODEL || (
    providerType === "gemini" ? DEFAULT_GEMINI_MODEL : DEFAULT_OPENAI_COMPATIBLE_MODEL
  );
  const providerName = storedConfig?.providerName || preset?.providerName || process.env.AI_PROVIDER_NAME
    || (providerType === "gemini" ? "gemini-compatible" : "openai-compatible");
  const apiUrl = storedConfig?.apiUrl || preset?.apiUrl || process.env.AI_API_URL || (
    providerType === "gemini"
      ? `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
      : DEFAULT_OPENAI_COMPATIBLE_URL
  );

  return {
    providerType,
    providerName,
    apiKey,
    model,
    apiUrl,
    presetKey: storedConfig?.presetKey || "custom",
    authHeader: storedConfig?.authHeader || preset?.authHeader || process.env.AI_AUTH_HEADER || "Authorization",
    authScheme: storedConfig?.authScheme ?? preset?.authScheme ?? process.env.AI_AUTH_SCHEME ?? "Bearer",
  };
};

export const isAiProviderConfigured = (storedConfig = null) => {
  const config = getAiConfig(storedConfig);
  return config.presetKey === "ollama" ? Boolean(config.apiUrl && config.model) : Boolean(config.apiKey);
};

export const validateAiProviderConfig = (storedConfig = null) => {
  const config = getAiConfig(storedConfig);

  if (!config.providerType || !["openai-compatible", "gemini"].includes(config.providerType)) {
    throw new Error("Provider type must be openai-compatible or gemini.");
  }

  if (!config.providerName?.trim()) {
    throw new Error("Provider name is required.");
  }

  if (!config.apiUrl?.trim()) {
    throw new Error("Provider endpoint URL is required.");
  }

  try {
    new URL(config.apiUrl);
  } catch {
    throw new Error("Provider endpoint URL is not valid.");
  }

  if (!config.model?.trim()) {
    throw new Error("Model name is required.");
  }

  if (config.presetKey !== "ollama" && !config.apiKey?.trim()) {
    throw new Error("AI API key is missing.");
  }

  if (!config.authHeader?.trim() && config.providerType !== "gemini") {
    throw new Error("Authentication header is required.");
  }

  return config;
};

const buildHeaders = (config) => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (config.providerType === "gemini") {
    return headers;
  }

  headers[config.authHeader] = config.authScheme
    ? `${config.authScheme} ${config.apiKey}`
    : config.apiKey;

  return headers;
};

const callOpenAiCompatibleApi = async (config, prompt) => {
  const response = await fetch(config.apiUrl, {
    method: "POST",
    headers: buildHeaders(config),
    body: JSON.stringify({
      model: config.model,
      input: prompt,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI provider request failed with status ${response.status}.`);
  }

  const data = await response.json();
  const parsed = extractJson(data.output_text);

  if (!parsed) {
    throw new Error("AI provider response could not be parsed into JSON.");
  }

  return {
    provider: config.providerName,
    ...parsed,
  };
};

const callGeminiApi = async (config, prompt) => {
  const joiner = config.apiUrl.includes("?") ? "&" : "?";
  const urlWithKey = `${config.apiUrl}${joiner}key=${encodeURIComponent(config.apiKey)}`;

  const response = await fetch(urlWithKey, {
    method: "POST",
    headers: buildHeaders(config),
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`AI provider request failed with status ${response.status}.`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((part) => part.text).join("\n") || "";
  const parsed = extractJson(text);

  if (!parsed) {
    throw new Error("AI provider response could not be parsed into JSON.");
  }

  return {
    provider: config.providerName,
    ...parsed,
  };
};

const requestAiNarrative = async (config, prompt) => {
  if (config.providerType === "gemini") {
    return callGeminiApi(config, prompt);
  }

  return callOpenAiCompatibleApi(config, prompt);
};

export const generateAiRiskNarrative = async (profile, storedConfig = null) => {
  const config = getAiConfig(storedConfig);
  if (!config.apiKey) {
    return null;
  }

  const prompt = buildPrompt(profile);
  return requestAiNarrative(config, prompt);
};

export const testAiProviderConnection = async (storedConfig = null) => {
  const config = validateAiProviderConfig(storedConfig);

  const prompt = `Return valid JSON only: {"summary":"connection-ok","keyConcerns":[],"interventions":[],"parentDraft":"ok","disclaimer":"ok"}`;
  const result = await requestAiNarrative(config, prompt);

  return {
    success: true,
    providerName: config.providerName,
    providerType: config.providerType,
    model: config.model,
    apiUrl: config.apiUrl,
    sampleSummary: result.summary,
  };
};
