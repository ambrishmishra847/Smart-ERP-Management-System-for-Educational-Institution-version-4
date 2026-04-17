import { Link } from "react-router-dom";

const ForgotPasswordPage = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
    <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
      <h1 className="text-center font-display text-3xl font-semibold text-slate-900">Forgot Password</h1>
      <p className="mt-4 text-center text-sm text-slate-600">
        Password recovery can be connected to email OTP or reset-link delivery from this shared access page.
      </p>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        Enter your registered email or role identifier in the next implementation step to receive a secure reset flow.
      </div>
      <Link
        to="/login"
        className="mt-6 block rounded-xl bg-blue-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
      >
        Back to Login
      </Link>
    </div>
  </div>
);

export default ForgotPasswordPage;
