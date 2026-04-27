import Image from "next/image";
import { setAuthCookies } from "../../lib/auth/session";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { queryRegister } from "../../graphql/user";
import { graphQLClient } from "../../plugins/graphql.plugin";
import { useStoreUser } from "../../store/user";

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPass: string;
  phone: string;
  username: string;
  birthday: string;
}

const Spinner = () => (
  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);

const inputClass =
  "w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 dark:focus:border-emerald-600 transition-all";

const Register = () => {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [sex, setSex] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassConfirm, setShowPassConfirm] = useState(false);
  const { setUser } = useStoreUser();
  const { register, handleSubmit } = useForm<RegisterForm>();

  const onSubmit = async (data: RegisterForm) => {
    if (data.password !== data.confirmPass) {
      toast.warn("Passwords don't match");
      return;
    }
    setIsLoading(true);
    const res = await graphQLClient.request(queryRegister, {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      phone: data.phone,
      username: data.username,
      fullName: `${data.firstName} ${data.lastName}`,
      sex,
      birthday: data.birthday,
      avatar: "https://i.imgur.com/rLpAsb4.png",
      coverImage: "https://i.imgur.com/rLpAsb4.png",
    });
    if (res.register.code !== 200) {
      toast.error(res.register.message);
      res.register.errors?.forEach((err: { message: string }) => toast.error(err.message));
      setIsLoading(false);
      return;
    }
    const { accessToken, refreshToken } = res.register;
    if (!accessToken || !refreshToken || !res.register.user) {
      toast.error("System error. Please try again.");
      setIsLoading(false);
      return;
    }
    setAuthCookies(accessToken, refreshToken, res.register.user.id);
    setUser(res.register.user);
    setIsLoading(false);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden grid lg:grid-cols-5">

        {/* Left decorative panel */}
        <div className="hidden lg:flex lg:col-span-2 bg-gradient-to-br from-emerald-500 to-teal-600 p-10 flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/10 rounded-full" />
          <div className="absolute bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full" />
          <div className="absolute top-1/3 right-6 w-24 h-24 bg-white/5 rounded-full" />
          <div className="relative z-10">
            <Link href="/">
              <Image src="/favicon/logo.png" width={90} height={36} alt="Logo" className="brightness-0 invert opacity-90" />
            </Link>
          </div>
          <div className="relative z-10 space-y-3">
            <h2 className="text-2xl font-bold text-white leading-tight">
              Join our community today
            </h2>
            <p className="text-emerald-100 text-sm leading-relaxed">
              Create your account and start connecting with friends around the world.
            </p>
          </div>
          <p className="relative z-10 text-emerald-200 text-xs">
            PTN Social © {new Date().getFullYear()}
          </p>
        </div>

        {/* Right form panel */}
        <div className="col-span-5 lg:col-span-3 p-8 sm:p-10 overflow-y-auto">
          <div className="lg:hidden mb-8">
            <Link href="/">
              <Image src="/favicon/logo.png" width={80} height={32} alt="Logo" />
            </Link>
          </div>

          <div className="max-w-sm w-full mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create account</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Fill in your details to get started</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="firstName" className="text-sm font-medium text-gray-700 dark:text-gray-300">First name</label>
                  <input
                    id="firstName"
                    {...register("firstName", { required: true })}
                    type="text"
                    placeholder="Pham"
                    required
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="lastName" className="text-sm font-medium text-gray-700 dark:text-gray-300">Last name</label>
                  <input
                    id="lastName"
                    {...register("lastName", { required: true })}
                    type="text"
                    placeholder="Nam"
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-1.5">
                <label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                <input
                  id="username"
                  {...register("username", { required: true })}
                  type="text"
                  placeholder="phamnam"
                  required
                  className={inputClass}
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
                <input
                  id="email"
                  {...register("email", { required: true })}
                  type="email"
                  placeholder="you@example.com"
                  required
                  className={inputClass}
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone number</label>
                <input
                  id="phone"
                  {...register("phone", { required: true })}
                  type="tel"
                  pattern="^(0\W*\W*(?:\d\W*){9})$"
                  placeholder="0987654321"
                  required
                  className={inputClass}
                />
              </div>

              {/* Birthday & Sex */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="birthday" className="text-sm font-medium text-gray-700 dark:text-gray-300">Birthday</label>
                  <input
                    id="birthday"
                    {...register("birthday", { required: true })}
                    type="date"
                    required
                    min="1970-01-01"
                    max="2030-12-31"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="sex" className="text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
                  <select
                    id="sex"
                    className={inputClass}
                    onChange={(e) => setSex(e.target.value === "true")}
                    defaultValue="true"
                  >
                    <option value="true">Male</option>
                    <option value="false">Female</option>
                  </select>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    {...register("password", { required: true })}
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    className={`${inputClass} pr-10`}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    {showPass ? <BsEye /> : <BsEyeSlash />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div className="space-y-1.5">
                <label htmlFor="confirmPass" className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm password</label>
                <div className="relative">
                  <input
                    id="confirmPass"
                    {...register("confirmPass", { required: true })}
                    type={showPassConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    className={`${inputClass} pr-10`}
                  />
                  <button type="button" onClick={() => setShowPassConfirm(!showPassConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    {showPassConfirm ? <BsEye /> : <BsEyeSlash />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors mt-2"
              >
                {isLoading && <Spinner />}
                {isLoading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="text-sm text-center text-gray-500 dark:text-gray-400">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
