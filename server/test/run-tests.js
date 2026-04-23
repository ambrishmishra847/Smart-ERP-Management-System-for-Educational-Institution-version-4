import assert from "node:assert/strict";
import { getAiConfig, getAiProviderPresetList, validateAiProviderConfig } from "../src/utils/aiRiskNarrative.js";
import { getImportTemplate } from "../src/utils/importTemplates.js";

const tests = [];

const test = (name, fn) => {
  tests.push({ name, fn });
};

test("admissions import normalizes source and status aliases", async () => {
  const template = getImportTemplate("admissions");
  const mapped = await template.mapRow({
    studentname: "Riya Singh",
    email: "riya@example.com",
    program: "BCA",
    academicyear: "2026",
    source: "pdf",
    status: "review",
  });

  assert.equal(mapped.source, "campaign");
  assert.equal(mapped.status, "under-review");
});

test("placements import validates minimum required fields", async () => {
  const template = getImportTemplate("placements");
  const mapped = await template.mapRow({
    companyname: "Open Future Labs",
    role: "Graduate Engineer",
    deadline: "2026-06-01",
  });

  assert.equal(
    template.validate(mapped),
    "Required fields: companyName, roleTitle, description, deadline"
  );
});

test("announcement import splits comma separated audience roles", async () => {
  const template = getImportTemplate("announcements");
  const mapped = await template.mapRow({
    title: "Semester Notice",
    content: "Classes resume Monday.",
    audience: "student, faculty-professor, parent-guardian",
  });

  assert.deepEqual(mapped.audience, ["student", "faculty-professor", "parent-guardian"]);
});

test("AI provider presets include all supported keys", () => {
  const presetKeys = getAiProviderPresetList().map((item) => item.key);

  assert.ok(presetKeys.includes("custom"));
  assert.ok(presetKeys.includes("openai-compatible"));
  assert.ok(presetKeys.includes("gemini"));
  assert.ok(presetKeys.includes("ollama"));
});

test("ollama preset validates without remote API key", () => {
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

test("custom AI provider keeps supplied config values", () => {
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

let passed = 0;

for (const entry of tests) {
  try {
    await entry.fn();
    passed += 1;
    console.log(`PASS ${entry.name}`);
  } catch (error) {
    console.error(`FAIL ${entry.name}`);
    console.error(error);
    process.exit(1);
  }
}

console.log(`All ${passed} tests passed.`);
