import SectionCard from "../components/ui/SectionCard";

const repoSections = [
  {
    title: "Repository Layout",
    points: [
      "`client/` contains the React + Vite frontend, route workspaces, dashboards, and shared UI components.",
      "`server/` contains the Express API, MongoDB models, business controllers, authentication, imports, and real-time notification logic.",
      "`scripts/` stores report-generation or support scripts used during project documentation and delivery.",
    ],
  },
  {
    title: "Core Feature Domains",
    points: [
      "Role-based portals for administration, academics, finance, HR, library, hostel, transport, placement, parent, and student access.",
      "Operational modules for admissions, attendance, assignments, study materials, announcements, results, fees, and service management.",
      "Production-oriented additions such as audit logs, rate limiting, structured validation, and suspension control.",
    ],
  },
  {
    title: "AI Integration Layer",
    points: [
      "Student risk scoring is calculated from ERP signals such as attendance, marks, assignments, and pending fees.",
      "AI integration is provider-configurable and used only for explanatory summaries, interventions, and parent communication drafts.",
      "The feature stays available with local deterministic output when no API key is configured.",
    ],
  },
  {
    title: "Local Setup Essentials",
    points: [
      "Backend environment uses MongoDB, JWT, SMTP, and optional OpenAI variables.",
      "Frontend environment uses `VITE_API_URL` to connect to the Express backend.",
      "Seed data and admin CLI commands are available for quick role testing and demo preparation.",
    ],
  },
];

const commands = [
  "cd server && npm install && npm run dev",
  "cd client && npm install && npm run dev",
  "cd server && npm run seed",
  "cd server && npm run create-admin -- \"Admin Name\" username password",
];

const envRows = [
  ["MONGODB_URI", "MongoDB local or Atlas connection string"],
  ["JWT_SECRET", "JWT signing secret for auth tokens"],
  ["SMTP_USER / SMTP_PASS", "Email delivery credentials for announcements"],
  ["AI_PROVIDER_TYPE", "Adapter mode such as `openai-compatible` or `gemini`"],
  ["AI_PROVIDER_NAME", "Display label for the configured AI provider"],
  ["AI_API_URL", "Provider endpoint used for AI narrative generation"],
  ["AI_API_KEY", "Optional key for AI risk explanation and intervention drafts"],
  ["AI_MODEL", "Provider model name"],
  ["AI_AUTH_HEADER / AI_AUTH_SCHEME", "Header configuration for compatible providers"],
  ["VITE_API_URL", "Frontend base API URL"],
];

const ProjectRepositoryPage = () => (
  <div className="space-y-6">
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-3xl font-semibold text-slate-900">Project Repository</h1>
      <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
        This section acts as the in-app technical repository overview for administrators and system maintainers. It describes how the Smart ERP
        project is organized, what each major layer is responsible for, and which environment inputs are needed to activate all major features.
      </p>
    </section>

    <section className="grid gap-6 xl:grid-cols-2">
      {repoSections.map((section) => (
        <SectionCard key={section.title} title={section.title}>
          <div className="space-y-3">
            {section.points.map((point) => (
              <div key={point} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                {point}
              </div>
            ))}
          </div>
        </SectionCard>
      ))}
    </section>

    <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <SectionCard title="Common Commands" subtitle="Quick commands used during development, testing, and demo prep.">
        <div className="space-y-3">
          {commands.map((command) => (
            <pre key={command} className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-950 p-4 text-sm text-slate-100">
              {command}
            </pre>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Environment Variables" subtitle="Variables required to activate the full application stack.">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="px-3 py-3 font-medium">Variable</th>
                <th className="px-3 py-3 font-medium">Purpose</th>
              </tr>
            </thead>
            <tbody>
              {envRows.map(([name, purpose]) => (
                <tr key={name} className="border-b border-slate-100">
                  <td className="px-3 py-3 font-mono text-slate-900">{name}</td>
                  <td className="px-3 py-3 text-slate-700">{purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </section>
  </div>
);

export default ProjectRepositoryPage;
