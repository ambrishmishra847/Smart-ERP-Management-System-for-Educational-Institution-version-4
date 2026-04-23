import test from "node:test";
import assert from "node:assert/strict";
import { getAiConfig, getAiProviderPresetList, validateAiProviderConfig } from "../src/utils/aiRiskNarrative.js";

test("AI provider presets expose supported provider keys", () => {
  const presets = getAiProviderPresetList();
  const presetKeys = presets.map((item) => item.key);

  assert.ok(presetKeys.includes("custom"));
  assert.ok(presetKeys.includes("openai-compatible"));
  assert.ok(presetKeys.includes("gemini"));
  assert.ok(presetKeys.includes("ollama"));
});

test("ollama preset can validate without remote API key", () => {
  const config = validateAiProviderConfig({
    presetKey: "ollama",
    providerType: "openai-compatible",
    providerName: "ollama",
    apiUrl: "http://localhost:11434/v1/chat/completions",
    model: "llama3.1",
    authHeader: "Authorization",
    authScheme: "Bearer",
  });

  assert.equal(config.presetKey, "ollama");
});

test("custom provider keeps supplied values when building config", () => {
  const config = getAiConfig({
    presetKey: "custom",
    providerType: "openai-compatible",
    providerName: "campus-gateway",
    apiUrl: "https://example.edu/ai",
    model: "smart-campus-1",
    authHeader: "Authorization",
    authScheme: "Bearer",
    apiKey: "secret",
  });

  assert.equal(config.providerName, "campus-gateway");
  assert.equal(config.apiUrl, "https://example.edu/ai");
  assert.equal(config.model, "smart-campus-1");
});
