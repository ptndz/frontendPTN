import { useState } from "react";
import { BsEyeSlash, BsEye } from "react-icons/bs";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { graphQLClient } from "../../plugins/graphql.plugin";
import { queryResetPassword } from "../../graphql/user";
import { useRouter } from "next/router";
import { HiArrowLeft } from "react-icons/hi";

interface IProps {
  token: string;
}

const Spinner = () => (
  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);

const inputClass =
  "w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 dark:focus:border-emerald-600 transition-all";

const ResetPassword: React.FC<IProps> = ({ token }) => {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassConfirm, setShowPassConfirm] = useState(false);
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data: any) => {
    if (data.password !== data.confirmPass) {
      toast.warn("Passwords don't match");
      return;
    }
    setIsLoading(true);
    const res = await graphQLClient.request(queryResetPassword, {
      token,
      password: data.password,
    });
    setIsLoading(false);
    if (res.resetPassword) {
      toast.success("Password reset successfully. Please log in.");
      return router.push("/login");
    }
    toast.error("Reset link is invalid or expired. Please try again.");
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
              Create a new password
            </h2>
            <p className="text-emerald-100 text-sm leading-relaxed">
              Choose a strong password to keep your account secure.
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reset password</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Enter your new password below
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  New password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    {...register("password", { required: true })}
                    type={showPass ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    required
                    className={`${inputClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPass ? <BsEye /> : <BsEyeSlash />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="confirmPass" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id="confirmPass"
                    {...register("confirmPass", { required: true })}
                    type={showPassConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    className={`${inputClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassConfirm(!showPassConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassConfirm ? <BsEye /> : <BsEyeSlash />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                {isLoading && <Spinner />}
                {isLoading ? "Saving..." : "Set new password"}
              </button>
            </form>

            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
            >
              <HiArrowLeft className="text-base" />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
