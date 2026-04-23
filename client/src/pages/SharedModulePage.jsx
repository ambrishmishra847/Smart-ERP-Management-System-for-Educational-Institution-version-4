import { Link } from "react-router-dom";
import SectionCard from "../components/ui/SectionCard";

const SharedModulePage = ({ title, subtitle, summary, points = [], links = [] }) => (
  <div className="space-y-6">
    <SectionCard title={title} subtitle={subtitle}>
      <p className="text-sm text-slate-600">{summary}</p>
    </SectionCard>

    <SectionCard title="Primary Functions" subtitle="This page is prepared for the mapped ERP role workflow.">
      <div className="grid gap-4 md:grid-cols-2">
        {points.map((point) => (
          <div key={point} className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
            {point}
          </div>
        ))}
      </div>
    </SectionCard>

    {links.length ? (
      <SectionCard title="Open Connected Modules" subtitle="Jump into the operational section connected to this role page.">
        <div className="grid gap-4 md:grid-cols-3">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </SectionCard>
    ) : null}
  </div>
);

export default SharedModulePage;
