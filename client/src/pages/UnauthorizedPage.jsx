import { Link } from "react-router-dom";

const UnauthorizedPage = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
    <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
      <h1 className="font-display text-3xl font-semibold text-slate-900">Unauthorized</h1>
      <p className="mt-4 text-sm text-slate-600">
        Your current role does not have access to that route. Use the correct role portal or return to your dashboard.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link to="/login" className="rounded-xl border border-slate-200 px-5 py-3 font-medium text-slate-700">
          Back to Login
        </Link>
        <Link to="/" className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white">
          Open Dashboard
        </Link>
      </div>
    </div>
  </div>
);

export default UnauthorizedPage;
