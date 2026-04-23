import { useEffect, useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import SectionCard from "../components/ui/SectionCard";
import api from "../services/api";
import MetricCard from "../components/ui/MetricCard";

const COLORS = ["#91c8ff", "#ffd166", "#6dd3a0", "#ff7f50"];

const variantConfig = {
  default: {
    title: "Primary Analytics",
    subtitle: "Detailed role-aware operational metrics.",
    primaryKeys: ["usersByRole", "courseStrength", "resultsBySubject"],
    secondaryKeys: ["feeByStatus", "admissionsByStatus", "workload"],
  },
  finance: {
    title: "Finance Analytics",
    subtitle: "Revenue, fee realization, and payment health across the institution.",
    primaryKeys: ["feeByStatus", "topCourses", "placementApplications"],
    secondaryKeys: ["feeByStatus", "admissionsByStatus"],
  },
  academic: {
    title: "Academic Analytics",
    subtitle: "Admissions progression, student outcomes, and teaching performance signals.",
    primaryKeys: ["usersByRole", "courseStrength", "resultsBySubject", "topCourses"],
    secondaryKeys: ["admissionsByStatus", "workload", "examsByType"],
  },
  placements: {
    title: "Placement Analytics",
    subtitle: "Drive activity, company response, and application conversion trends.",
    primaryKeys: ["placementApplications", "topCourses"],
    secondaryKeys: ["placementApplications", "admissionsByStatus"],
  },
};

const pickFirstChart = (charts, keys = []) => keys.map((key) => charts?.[key]).find((value) => Array.isArray(value) && value.length) || [];

const AnalyticsPage = ({ variant = "default" }) => {
  const [analytics, setAnalytics] = useState({ summary: {}, charts: {} });
  const config = variantConfig[variant] || variantConfig.default;

  useEffect(() => {
    api.get("/erp/analytics").then((response) => setAnalytics(response.data));
  }, []);

  const summaryItems = Object.entries(analytics.summary || {}).map(([key, value]) => ({
    label: key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase()),
    value,
    trend: "Live",
  }));

  const primaryChart = pickFirstChart(analytics.charts, config.primaryKeys);
  const secondaryChart = pickFirstChart(analytics.charts, config.secondaryKeys);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryItems.map((item, index) => (
          <MetricCard key={item.label} item={item} index={index} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <SectionCard title={config.title} subtitle={config.subtitle}>
          <div className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={primaryChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" />
                <Tooltip />
                <Bar dataKey="value" fill="#91c8ff" radius={[8, 8, 0, 0]} />
                <Bar dataKey="students" fill="#ffd166" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Distribution" subtitle="Status-level distribution for finance, admissions, exams, workload, or placement interest.">
          <div className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={secondaryChart}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={120}
                >
                  {secondaryChart.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Predictive Analytics" subtitle="What is likely to happen next based on the current signal set.">
          <div className="space-y-3">
            {(analytics.insights?.predictive || []).map((item) => (
              <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Prescriptive Analytics" subtitle="Suggested action steps to improve outcomes.">
          <div className="space-y-3">
            {(analytics.insights?.prescriptive || []).map((item) => (
              <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </SectionCard>
      </section>

      {(analytics.insights?.engagement || analytics.insights?.mastery) ? (
        <section className="grid gap-6 xl:grid-cols-2">
          <SectionCard title="Engagement Signals" subtitle="Participation and learning interaction indicators.">
            <div className="space-y-3">
              {(analytics.insights?.engagement || []).map((item) => (
                <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Concept Mastery" subtitle="Topic-level understanding and teaching effectiveness guidance.">
            <div className="space-y-3">
              {(analytics.insights?.mastery || []).map((item) => (
                <div key={item.topic} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-medium text-slate-900">{item.topic}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.status}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </section>
      ) : null}
    </div>
  );
};

export default AnalyticsPage;
