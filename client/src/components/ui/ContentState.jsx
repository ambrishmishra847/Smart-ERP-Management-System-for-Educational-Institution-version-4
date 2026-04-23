const toneClasses = {
  loading: "border-sky-200 bg-sky-50 text-sky-700",
  empty: "border-slate-200 bg-slate-50 text-slate-600",
  error: "border-rose-200 bg-rose-50 text-rose-700",
};

const ContentState = ({
  tone = "empty",
  title,
  description,
  action,
  compact = false,
}) => (
  <div
    className={`rounded-2xl border px-5 py-6 ${toneClasses[tone] || toneClasses.empty} ${
      compact ? "text-sm" : ""
    }`}
  >
    <p className={`font-semibold ${compact ? "text-base" : "text-lg"}`}>{title}</p>
    {description ? <p className="mt-2 max-w-2xl text-sm leading-6">{description}</p> : null}
    {action ? <div className="mt-4">{action}</div> : null}
  </div>
);

export default ContentState;
