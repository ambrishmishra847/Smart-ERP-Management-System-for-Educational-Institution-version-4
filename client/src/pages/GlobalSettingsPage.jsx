import { useEffect, useState } from "react";
import SectionCard from "../components/ui/SectionCard";
import api from "../services/api";

const initialForm = {
  institutionName: "",
  shortName: "",
  contactEmail: "",
  contactPhone: "",
  website: "",
  address: "",
  academicSession: "",
  campusName: "",
  timezone: "Asia/Calcutta",
  announcementFooter: "",
  defaultStudentPassword: "Student@123",
  defaultFeeAmount: 0,
  defaultFeeDueDays: 30,
  maintenanceMode: false,
  aiProvider: {
    presetKey: "custom",
    providerType: "openai-compatible",
    providerName: "custom-ai",
    apiUrl: "",
    apiKey: "",
    model: "",
    authHeader: "Authorization",
    authScheme: "Bearer",
    hasApiKey: false,
  },
};

const defaultPresets = [
  { key: "custom", label: "Custom Provider", providerType: "openai-compatible", providerName: "custom-ai", apiUrl: "", model: "", authHeader: "Authorization", authScheme: "Bearer", requiresApiKey: true },
  { key: "openai-compatible", label: "OpenAI-Compatible", providerType: "openai-compatible", providerName: "openai-compatible", apiUrl: "https://api.openai.com/v1/responses", model: "gpt-4.1-mini", authHeader: "Authorization", authScheme: "Bearer", requiresApiKey: true },
  { key: "gemini", label: "Gemini-Compatible", providerType: "gemini", providerName: "gemini-compatible", apiUrl: "", model: "gemini-2.5-flash", authHeader: "x-goog-api-key", authScheme: "", requiresApiKey: true },
  { key: "ollama", label: "Ollama (Local)", providerType: "openai-compatible", providerName: "ollama", apiUrl: "http://localhost:11434/v1/chat/completions", model: "llama3.1", authHeader: "Authorization", authScheme: "Bearer", requiresApiKey: false },
];

const statusStyles = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-rose-200 bg-rose-50 text-rose-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
};

const GlobalSettingsPage = () => {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);
  const [testingAi, setTestingAi] = useState(false);
  const [aiPresets, setAiPresets] = useState(defaultPresets);

  const load = async () => {
    const response = await api.get("/erp/settings/global");
    setForm({
      institutionName: response.data.institutionName || "",
      shortName: response.data.shortName || "",
      contactEmail: response.data.contactEmail || "",
      contactPhone: response.data.contactPhone || "",
      website: response.data.website || "",
      address: response.data.address || "",
      academicSession: response.data.academicSession || "",
      campusName: response.data.campusName || "",
      timezone: response.data.timezone || "Asia/Calcutta",
      announcementFooter: response.data.announcementFooter || "",
      defaultStudentPassword: response.data.defaultStudentPassword || "Student@123",
      defaultFeeAmount: response.data.defaultFeeAmount || 0,
      defaultFeeDueDays: response.data.defaultFeeDueDays || 30,
      maintenanceMode: Boolean(response.data.maintenanceMode),
      aiProvider: {
        presetKey: response.data.aiProvider?.presetKey || "custom",
        providerType: response.data.aiProvider?.providerType || "openai-compatible",
        providerName: response.data.aiProvider?.providerName || "custom-ai",
        apiUrl: response.data.aiProvider?.apiUrl || "",
        apiKey: "",
        model: response.data.aiProvider?.model || "",
        authHeader: response.data.aiProvider?.authHeader || "Authorization",
        authScheme: response.data.aiProvider?.authScheme || "Bearer",
        hasApiKey: Boolean(response.data.aiProvider?.hasApiKey),
      },
    });
    setAiPresets(Array.isArray(response.data.aiProviderPresets) && response.data.aiProviderPresets.length ? response.data.aiProviderPresets : defaultPresets);
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAiChange = (event) => {
    const { name, value } = event.target;
    if (name === "presetKey") {
      const selectedPreset = aiPresets.find((preset) => preset.key === value);
      if (selectedPreset) {
        setForm((prev) => ({
          ...prev,
          aiProvider: {
            ...prev.aiProvider,
            presetKey: selectedPreset.key,
            providerType: selectedPreset.providerType,
            providerName: selectedPreset.providerName,
            apiUrl: selectedPreset.apiUrl,
            model: selectedPreset.model,
            authHeader: selectedPreset.authHeader,
            authScheme: selectedPreset.authScheme,
          },
        }));
        return;
      }
    }
    setForm((prev) => ({
      ...prev,
      aiProvider: {
        ...prev.aiProvider,
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (event) => {
    event?.preventDefault();
    setStatus(null);
    setAiStatus(null);
    try {
      await api.post("/erp/settings/global", {
        ...form,
        defaultFeeAmount: Number(form.defaultFeeAmount || 0),
        defaultFeeDueDays: Number(form.defaultFeeDueDays || 30),
        aiProvider: {
          presetKey: form.aiProvider.presetKey,
          providerType: form.aiProvider.providerType,
          providerName: form.aiProvider.providerName,
          apiUrl: form.aiProvider.apiUrl,
          apiKey: form.aiProvider.apiKey,
          model: form.aiProvider.model,
          authHeader: form.aiProvider.authHeader,
          authScheme: form.aiProvider.authScheme,
        },
      });
      setStatus({
        type: "success",
        title: "Global settings saved",
        message: "Institution profile, defaults, and ERP operating preferences were updated successfully.",
      });
      setAiStatus({
        type: "success",
        title: "AI provider settings saved",
        message: form.aiProvider.apiKey
          ? "The provider configuration was saved and a new API key was stored."
          : "The provider configuration was saved. The existing stored key has been kept unchanged.",
      });
      await load();
    } catch (error) {
      setStatus({
        type: "error",
        title: "Unable to save settings",
        message: error.response?.data?.message || "The ERP could not save global settings right now.",
      });
    }
  };

  const handleTestAi = async () => {
    setTestingAi(true);
    setAiStatus(null);
    try {
      const response = await api.post("/erp/settings/global/ai/test", {
        presetKey: form.aiProvider.presetKey,
        providerType: form.aiProvider.providerType,
        providerName: form.aiProvider.providerName,
        apiUrl: form.aiProvider.apiUrl,
        apiKey: form.aiProvider.apiKey,
        model: form.aiProvider.model,
        authHeader: form.aiProvider.authHeader,
        authScheme: form.aiProvider.authScheme,
      });
      setAiStatus({
        type: "success",
        title: "Connection successful",
        message: `${response.data.providerName} responded successfully using model ${response.data.model}.`,
      });
    } catch (error) {
      setAiStatus({
        type: "error",
        title: "Connection failed",
        message: error.response?.data?.message || "The AI provider connection test failed.",
      });
    } finally {
      setTestingAi(false);
    }
  };

  const selectedPreset = aiPresets.find((preset) => preset.key === form.aiProvider.presetKey) || defaultPresets[0];
  const isCustomPreset = selectedPreset.key === "custom";
  const isGeminiPreset = form.aiProvider.providerType === "gemini";
  const isOllamaPreset = selectedPreset.key === "ollama";
  const requiresApiKey = selectedPreset.requiresApiKey !== false;
  const isProviderLocked = !isCustomPreset;
  const providerGuidance = isOllamaPreset
    ? "Ollama runs locally. Keep the local endpoint reachable and leave the API key empty unless your local gateway requires one."
    : isGeminiPreset
      ? "Gemini-compatible providers use an API-key style header. The auth scheme field is not needed here."
      : "OpenAI-compatible providers typically use a Bearer token over an Authorization header.";

  return (
    <div className="space-y-6">
      <SectionCard title="Institution Profile" subtitle="Maintain the core identity and operating defaults of the ERP.">
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <input name="institutionName" value={form.institutionName} onChange={handleChange} required placeholder="Institution name" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input name="shortName" value={form.shortName} onChange={handleChange} required placeholder="Short name" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input name="contactEmail" type="email" value={form.contactEmail} onChange={handleChange} placeholder="Contact email" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input name="contactPhone" value={form.contactPhone} onChange={handleChange} placeholder="Contact phone" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input name="website" value={form.website} onChange={handleChange} placeholder="Website URL" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input name="campusName" value={form.campusName} onChange={handleChange} placeholder="Campus name" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input name="academicSession" value={form.academicSession} onChange={handleChange} placeholder="Academic session" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input name="timezone" value={form.timezone} onChange={handleChange} placeholder="Timezone" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input name="defaultStudentPassword" value={form.defaultStudentPassword} onChange={handleChange} placeholder="Default student password" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input name="defaultFeeAmount" type="number" min="0" value={form.defaultFeeAmount} onChange={handleChange} placeholder="Default onboarding fee" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input name="defaultFeeDueDays" type="number" min="1" value={form.defaultFeeDueDays} onChange={handleChange} placeholder="Default fee due days" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900">
            <input name="maintenanceMode" type="checkbox" checked={form.maintenanceMode} onChange={handleChange} />
            Enable maintenance mode
          </label>
          <textarea name="address" value={form.address} onChange={handleChange} rows={3} placeholder="Institution address" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none md:col-span-2" />
          <textarea name="announcementFooter" value={form.announcementFooter} onChange={handleChange} rows={3} placeholder="Announcement footer" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none md:col-span-2" />
          {status ? (
            <div className={`rounded-xl border px-4 py-3 text-sm md:col-span-2 ${statusStyles[status.type]}`}>
              <p className="font-semibold">{status.title}</p>
              <p className="mt-1">{status.message}</p>
            </div>
          ) : null}
          <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white md:col-span-2">Save Global Settings</button>
        </form>
      </SectionCard>

      <SectionCard title="AI Provider Settings" subtitle="Configure the external AI provider used for risk explanations, interventions, and parent drafts.">
        <div className="grid gap-4 md:grid-cols-2">
          <select name="presetKey" value={form.aiProvider.presetKey} onChange={handleAiChange} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
            {aiPresets.map((preset) => (
              <option key={preset.key} value={preset.key}>{preset.label}</option>
            ))}
          </select>
          <select name="providerType" value={form.aiProvider.providerType} onChange={handleAiChange} disabled={isProviderLocked} className={`rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ${isProviderLocked ? "cursor-not-allowed bg-slate-100 text-slate-500" : ""}`}>
            <option value="openai-compatible">OpenAI-Compatible</option>
            <option value="gemini">Gemini-Compatible</option>
          </select>
          <input name="providerName" value={form.aiProvider.providerName} onChange={handleAiChange} disabled={isProviderLocked} placeholder="Provider display name" className={`rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ${isProviderLocked ? "cursor-not-allowed bg-slate-100 text-slate-500" : ""}`} />
          <input name="apiUrl" value={form.aiProvider.apiUrl} onChange={handleAiChange} disabled={isProviderLocked && !isOllamaPreset} placeholder="Provider endpoint URL" className={`rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none md:col-span-2 ${(isProviderLocked && !isOllamaPreset) ? "cursor-not-allowed bg-slate-100 text-slate-500" : ""}`} />
          <input name="model" value={form.aiProvider.model} onChange={handleAiChange} disabled={isProviderLocked} placeholder="Model name" className={`rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ${isProviderLocked ? "cursor-not-allowed bg-slate-100 text-slate-500" : ""}`} />
          {!isGeminiPreset ? (
            <>
              <input name="authHeader" value={form.aiProvider.authHeader} onChange={handleAiChange} disabled={isProviderLocked} placeholder="Auth header" className={`rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ${isProviderLocked ? "cursor-not-allowed bg-slate-100 text-slate-500" : ""}`} />
              <input name="authScheme" value={form.aiProvider.authScheme} onChange={handleAiChange} disabled={isProviderLocked} placeholder="Auth scheme" className={`rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ${isProviderLocked ? "cursor-not-allowed bg-slate-100 text-slate-500" : ""}`} />
            </>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 md:col-span-2">
              Gemini-compatible providers manage authentication through the configured API key, so extra auth scheme fields are hidden here.
            </div>
          )}
          {requiresApiKey ? (
            <input
              name="apiKey"
              type="password"
              value={form.aiProvider.apiKey}
              onChange={handleAiChange}
              placeholder={form.aiProvider.hasApiKey ? "API key saved. Enter a new key to replace it." : "API key"}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
            />
          ) : (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              This preset can run without a remote API key.
            </div>
          )}
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 md:col-span-2">
            {form.aiProvider.hasApiKey
              ? "An AI API key is already saved for this institution. Leave the key field empty to keep the existing key."
              : "No AI API key is currently saved. The ERP will use deterministic local summaries until one is configured."}
            <span className="block mt-2 text-slate-500">{providerGuidance}</span>
          </div>
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-slate-700 md:col-span-2">
            <p className="font-medium text-slate-900">Current provider summary</p>
            <div className="mt-2 grid gap-2 md:grid-cols-2">
              <p>Preset: {aiPresets.find((preset) => preset.key === form.aiProvider.presetKey)?.label || "Custom"}</p>
              <p>Type: {form.aiProvider.providerType}</p>
              <p>Model: {form.aiProvider.model || "Not set"}</p>
              <p>Header: {form.aiProvider.authHeader || "Not set"}</p>
            </div>
          </div>
          {aiStatus ? (
            <div className={`rounded-xl border px-4 py-3 text-sm md:col-span-2 ${statusStyles[aiStatus.type]}`}>
              <p className="font-semibold">{aiStatus.title}</p>
              <p className="mt-1">{aiStatus.message}</p>
            </div>
          ) : null}
          <button type="button" onClick={handleTestAi} disabled={testingAi} className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-900">
            {testingAi ? "Testing AI Provider..." : "Test AI Connection"}
          </button>
          <button type="button" onClick={handleSubmit} className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white">
            Save AI Provider Settings
          </button>
        </div>
      </SectionCard>
    </div>
  );
};

export default GlobalSettingsPage;
