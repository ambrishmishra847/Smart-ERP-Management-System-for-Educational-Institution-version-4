import { useEffect, useMemo, useState } from "react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import MetricCard from "../components/ui/MetricCard";
import SectionCard from "../components/ui/SectionCard";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { hasPermission, PERMISSIONS } from "../utils/access";
import { formatDate } from "../utils/formatters";

const levelTone = {
  low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  moderate: "bg-amber-50 text-amber-700 border-amber-200",
  high: "bg-orange-50 text-orange-700 border-orange-200",
  critical: "bg-rose-50 text-rose-700 border-rose-200",
};

const interventionDefaults = {
  category: "counseling",
  status: "pending",
  priority: "moderate",
  title: "",
  notes: "",
  nextFollowUpAt: "",
};

const AiRiskAnalysisPage = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [savingIntervention, setSavingIntervention] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [interventionForm, setInterventionForm] = useState(interventionDefaults);

  const canSearchMany = useMemo(
    () => hasPermission(user, PERMISSIONS.USERS_MANAGE) || hasPermission(user, PERMISSIONS.STUDENTS_MANAGE) || hasPermission(user, PERMISSIONS.ANALYTICS_VIEW),
    [user]
  );

  const loadProfiles = async (query = "") => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/erp/ai-risk", {
        params: query ? { q: query } : {},
      });
      const rows = Array.isArray(response.data) ? response.data : [];
      setProfiles(rows);

      if (rows.length) {
        const nextSelectedId = rows.some((item) => item.student._id === selectedId)
          ? selectedId
          : rows[0].student._id;
        setSelectedId(nextSelectedId);
      } else {
        setSelectedId("");
        setAnalysis(null);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load student risk profiles.");
    } finally {
      setLoading(false);
    }
  };

  const loadAnalysis = async (studentId) => {
    if (!studentId) {
      return;
    }

    setAnalyzing(true);
    setError("");
    setMessage("");
    try {
      const response = await api.get(`/erp/ai-risk/${studentId}`);
      setAnalysis(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to generate risk analysis right now.");
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  useEffect(() => {
    if (selectedId) {
      loadAnalysis(selectedId);
    }
  }, [selectedId]);

  const handleInterventionChange = (event) => {
    const { name, value } = event.target;
    setInterventionForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submitIntervention = async (event) => {
    event.preventDefault();
    if (!selectedId) {
      return;
    }

    setSavingIntervention(true);
    setError("");
    setMessage("");
    try {
      await api.post(`/erp/ai-risk/${selectedId}/interventions`, interventionForm);
      setMessage("Intervention added successfully.");
      setInterventionForm(interventionDefaults);
      await loadAnalysis(selectedId);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to save intervention.");
    } finally {
      setSavingIntervention(false);
    }
  };

  const updateInterventionStatus = async (interventionId, status) => {
    setError("");
    setMessage("");
    try {
      await api.patch(`/erp/ai-risk/${selectedId}/interventions/${interventionId}`, { status });
      setMessage(`Intervention moved to ${status}.`);
      await loadAnalysis(selectedId);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update intervention.");
    }
  };

  const summaryMetrics = analysis
    ? [
        { label: "Risk Score", value: `${analysis.riskScore}/100`, trend: "Composite ERP score" },
        { label: "Attendance", value: `${analysis.metrics.attendancePercentage}%`, trend: `${analysis.metrics.totalClasses} classes tracked` },
        { label: "Avg Marks", value: `${analysis.metrics.averageMarks}%`, trend: analysis.metrics.markTrend || "stable" },
        { label: "Open Interventions", value: analysis.interventions?.filter((item) => ["pending", "in-progress"].includes(item.status)).length || 0, trend: "Needs follow-up" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">AI Student Risk Analysis</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Smart ERP computes a student risk score from attendance, marks, assignments, and fee signals. The system now keeps
            trend history, explains the score breakdown, and helps faculty or HODs track interventions against at-risk students.
          </p>
        </div>

        {canSearchMany ? (
          <div className="w-full max-w-md">
            <label className="mb-2 block text-sm font-medium text-slate-700">Search students</label>
            <div className="flex gap-2">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, roll number, class..."
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400"
              />
              <button
                type="button"
                onClick={() => loadProfiles(search)}
                className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
              >
                Search
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.45fr]">
        <SectionCard title="Student Risk Queue" subtitle="Prioritized by current calculated risk score.">
          {loading ? (
            <p className="text-sm text-slate-500">Loading risk profiles...</p>
          ) : profiles.length ? (
            <div className="space-y-3">
              {profiles.map((profile) => (
                <button
                  key={profile.student._id}
                  type="button"
                  onClick={() => setSelectedId(profile.student._id)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selectedId === profile.student._id
                      ? "border-blue-400 bg-blue-50"
                      : "border-slate-200 bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{profile.student.name}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {profile.student.rollNumber || "No roll number"} • {profile.student.className || "Unassigned class"}
                      </p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${levelTone[profile.riskLevel] || levelTone.low}`}>
                      {profile.riskLevel}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                    <p>Risk score: {profile.riskScore}/100</p>
                    <p>Attendance: {profile.metrics.attendancePercentage}%</p>
                    <p>Marks: {profile.metrics.averageMarks}%</p>
                    <p>Missing tasks: {profile.metrics.missingAssignments}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No accessible student profiles were found for this role.</p>
          )}
        </SectionCard>

        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryMetrics.map((item, index) => (
              <MetricCard key={item.label} item={item} index={index} />
            ))}
          </section>

          <SectionCard
            title={analysis ? `${analysis.student.name} - Risk Advisory` : "Risk Advisory"}
            subtitle="Combines deterministic ERP scoring with optional provider-generated explanation."
            action={
              analysis ? (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                  Source: {analysis.aiNarrative?.provider || "local"}
                </span>
              ) : null
            }
          >
            {!selectedId ? (
              <p className="text-sm text-slate-500">Select a student from the risk queue to generate the detailed advisory.</p>
            ) : analyzing ? (
              <p className="text-sm text-slate-500">Generating advisory summary...</p>
            ) : analysis ? (
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${levelTone[analysis.riskLevel] || levelTone.low}`}>
                      {analysis.riskLevel}
                    </span>
                    <span className="text-sm text-slate-500">
                      {analysis.student.department || "Academic department not set"} • {analysis.student.section || "Section not set"}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-700">{analysis.aiNarrative?.summary}</p>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <SectionCard title="Key Concerns" subtitle="Signals contributing to the current risk state.">
                    <div className="space-y-3">
                      {(analysis.aiNarrative?.keyConcerns || analysis.factors.map((factor) => factor.label)).map((item) => (
                        <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                          {item}
                        </div>
                      ))}
                    </div>
                  </SectionCard>

                  <SectionCard title="Recommended Interventions" subtitle="Actionable next steps for teachers, mentors, or coordinators.">
                    <div className="space-y-3">
                      {(analysis.aiNarrative?.interventions || analysis.recommendedActions).map((item) => (
                        <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                          {item}
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <SectionCard title="Risk Score Breakdown" subtitle="See exactly how the composite score was formed.">
                    <div className="space-y-3">
                      {analysis.scoreBreakdown?.length ? (
                        analysis.scoreBreakdown.map((item) => (
                          <div key={`${item.key}-${item.label}`} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                            <span className="font-medium text-slate-900">{item.label}</span>
                            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">+{item.points}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">No risk penalties are active for this student right now.</p>
                      )}
                    </div>
                  </SectionCard>

                  <SectionCard title="Risk Trend History" subtitle="Track whether the student is improving, stable, or worsening over time.">
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analysis.trend || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="name" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip />
                          <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </SectionCard>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <SectionCard title="Subject-Level Risk Signals" subtitle="Weakest academic areas detected from published results.">
                    <div className="space-y-3">
                      {(analysis.metrics.weakestSubjects || []).length ? (
                        analysis.metrics.weakestSubjects.map((subject) => (
                          <div key={subject.name} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                            <span className="font-medium text-slate-900">{subject.name}</span>
                            <span className="text-slate-600">{subject.average}% average</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">No subject-wise result history is available yet.</p>
                      )}
                    </div>
                  </SectionCard>

                  <SectionCard title="Parent Communication Draft" subtitle="Ready-to-review message for outreach or counseling follow-up.">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700 whitespace-pre-line">
                      {analysis.aiNarrative?.parentDraft}
                    </div>
                  </SectionCard>
                </div>

                <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                  <SectionCard title="Log New Intervention" subtitle="Turn analysis into action and track follow-ups.">
                    <form onSubmit={submitIntervention} className="space-y-3">
                      <select name="category" value={interventionForm.category} onChange={handleInterventionChange} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
                        <option value="counseling">Counseling</option>
                        <option value="parent-contact">Parent Contact</option>
                        <option value="remedial-plan">Remedial Plan</option>
                        <option value="attendance-followup">Attendance Follow-up</option>
                        <option value="fee-followup">Fee Follow-up</option>
                        <option value="academic-review">Academic Review</option>
                      </select>
                      <select name="priority" value={interventionForm.priority} onChange={handleInterventionChange} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
                        <option value="low">Low</option>
                        <option value="moderate">Moderate</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                      <input name="title" value={interventionForm.title} onChange={handleInterventionChange} placeholder="Intervention title" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
                      <textarea name="notes" value={interventionForm.notes} onChange={handleInterventionChange} rows={4} placeholder="Notes, outcome, or context" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
                      <input name="nextFollowUpAt" type="date" value={interventionForm.nextFollowUpAt} onChange={handleInterventionChange} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
                      <button type="submit" disabled={savingIntervention} className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white disabled:opacity-70">
                        {savingIntervention ? "Saving..." : "Save Intervention"}
                      </button>
                    </form>
                  </SectionCard>

                  <SectionCard title="Intervention Tracker" subtitle="Track counseling, follow-ups, and pending actions.">
                    <div className="space-y-3">
                      {analysis.interventions?.length ? (
                        analysis.interventions.map((item) => (
                          <div key={item._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold text-slate-900">{item.title}</p>
                                <p className="mt-1 text-sm text-slate-500">
                                  {item.category} • {item.priority} • created {formatDate(item.createdAt)}
                                </p>
                              </div>
                              <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${levelTone[item.priority] || levelTone.moderate}`}>
                                {item.status}
                              </span>
                            </div>
                            {item.notes ? <p className="mt-3 text-sm text-slate-700">{item.notes}</p> : null}
                            <div className="mt-3 flex flex-wrap gap-2">
                              {item.status !== "in-progress" ? (
                                <button type="button" onClick={() => updateInterventionStatus(item._id, "in-progress")} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900">
                                  Mark In Progress
                                </button>
                              ) : null}
                              {item.status !== "completed" ? (
                                <button type="button" onClick={() => updateInterventionStatus(item._id, "completed")} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900">
                                  Mark Completed
                                </button>
                              ) : null}
                              {item.status !== "closed" ? (
                                <button type="button" onClick={() => updateInterventionStatus(item._id, "closed")} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900">
                                  Close
                                </button>
                              ) : null}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">No interventions are logged yet for this student.</p>
                      )}
                    </div>
                  </SectionCard>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-500">
                  {analysis.aiNarrative?.disclaimer}
                </div>
              </div>
            ) : null}
          </SectionCard>
        </div>
      </section>
    </div>
  );
};

export default AiRiskAnalysisPage;
