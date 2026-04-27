import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import "react-toastify/dist/ReactToastify.css";
import { graphQLClient, graphQLClientErrorCheck } from "../../plugins/graphql.plugin";
import { queryForgotPassword } from "../../graphql/user";
import { BsCheckCircle } from "react-icons/bs";
import { HiArrowLeft } from "react-icons/hi";

const Spinner = () => (
  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showText, setShowText] = useState(false);
  const { register, handleSubmit } = useForm<{ email: string }>();

  const onSubmit = async (data: { email: string }) => {
    if (!data.email) return;
    setIsLoading(true);
    const res = await graphQLClient.request(queryForgotPassword, { email: data.email });
    if (graphQLClientErrorCheck(res)) setShowText(true);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden grid lg:grid-cols-5">

        {/* Left decorative panel */}
        <div className="hidden lg:flex lg:col-span-2 bg-gradient-to-br from-emerald-500 to-teal-600 p-10 flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/10 rounded-full" />
          <div className="absolute bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full" />
          <div className="relative z-10">
            <Link href="/">
              <Image src="/favicon/logo.png" width={90} height={36} alt="Logo" className="brightness-0 invert opacity-90" />
            </Link>
          </div>
          <div className="relative z-10 space-y-3">
            <h2 className="text-2xl font-bold text-white leading-tight">
              No worries, it happens!
            </h2>
            <p className="text-emerald-100 text-sm leading-relaxed">
              Enter your email and we'll send you a link to reset your password.
            </p>
          </div>
          <p className="relative z-10 text-emerald-200 text-xs">
            PTN Social © {new Date().getFullYear()}
          </p>
        </div>

        {/* Right form panel */}
        <div className="col-span-5 lg:col-span-3 p-8 sm:p-10 flex flex-col justify-center">
          <div className="lg:hidden mb-8">
            <Link href="/">
              <Image src="/favicon/logo.png" width={80} height={32} alt="Logo" />
            </Link>
          </div>

          <div className="max-w-sm w-full mx-auto space-y-6">
            {showText ? (
              /* Success state */
              <div className="text-center space-y-4 py-6">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl flex items-center justify-center mx-auto">
                  <BsCheckCircle className="text-3xl text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Check your email</h2>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    We've sent a password reset link to your email address. Check your inbox and follow the instructions.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                >
                  <HiArrowLeft className="text-base" />
                  Back to sign in
                </Link>
              </div>
            ) : (
              /* Form state */
              <>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Forgot password?</h1>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Enter your email to receive a reset link
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email address
                    </label>
                    <input
                      id="email"
                      {...register("email", { required: true })}
                      type="email"
                      placeholder="you@example.com"
                      required
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 dark:focus:border-emerald-600 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    {isLoading && <Spinner />}
                    {isLoading ? "Sending..." : "Send reset link"}
                  </button>
                </form>

                <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                  Remember your password?{" "}
                  <Link href="/login" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
