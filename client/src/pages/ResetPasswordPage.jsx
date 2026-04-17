import { Link } from "react-router-dom";

const ResetPasswordPage = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
    <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
      <h1 className="text-center font-display text-3xl font-semibold text-slate-900">Reset Password</h1>
      <p className="mt-4 text-center text-sm text-slate-600">
        This page is reserved for secure token-based password reset after the account recovery flow is triggered.
      </p>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        The backend hook is ready to be extended with email reset tokens, OTP verification, and password rotation policy.
      </div>
      <Link
        to="/login"
        className="mt-6 block rounded-xl bg-blue-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
      >
        Return to Login
      </Link>
    </div>
  </div>
);

export default ResetPasswordPage;
