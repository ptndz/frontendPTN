import { useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";

import "react-toastify/dist/ReactToastify.css";

import { useRouter } from "next/router";
import { graphQLClient } from "../../plugins/graphql.plugin";
import { queryForgotPassword } from "../../graphql/user";

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showText, setShowText] = useState(false);

  const { register, handleSubmit } = useForm();

  const onSubmit = async (data: any) => {
    if (data.email) {
      const res = await graphQLClient.request(queryForgotPassword, {
        email: data.email,
      });
      if (res.forgotPassword) {
        setShowText(true);
      }
      setIsLoading(false);
    }
  };

  return (
    <section className="lg:py-10 lg:px-6">
      <div className="max-w-5xl mx-auto rounded-lg overflow-hidden grid min-h-screen lg:grid-cols-5 grid-cols-2">
        <div className="hidden lg:flex col-span-2 bg-white dark:bg-black bg-pattern-login">
          <div className="flex flex-col justify-start items-start py-10 pl-16"></div>
        </div>
        <div className="bg-white dark:bg-black col-span-3 flex flex-col pb-20">
          <div className="mt-8 mx-auto w-full max-w-md">
            <div className="flex flex-col justify-start items-start mb-10">
              <Link href="/">
                <Image
                  src="/favicon/logo.png"
                  alt="logo"
                  width={300}
                  height={100}
                />
              </Link>
              <h1 className="text-gray-900 dark:text-white font-bold text-3xl font-title pl-4">
                Create an account
              </h1>
            </div>
            <div className={`${showText ? "" : "hidden"}`}>
              <h1 className="text-gray-900 dark:text-white font-bold text-3xl font-title pl-4">
                We have sent a link to your email
              </h1>
            </div>
            <div className="rounded-lg px-4">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-lg text-gray-900 dark:text-white">
                    Email address<span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      {...register("email", { required: true })}
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="example@mail.com"
                      className="appearance-none bg-transparent block w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  {isLoading ? (
                    <button
                      disabled
                      type="button"
                      className="w-full flex justify-center py-2 px-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm text-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 items-center">
                      <svg
                        role="status"
                        className="inline mr-3 w-4 h-4 text-white animate-spin"
                        viewBox="0 0 100 101"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9184 73.1895 90.9184 50.5908C90.9184 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                          fill="#E5E7EB"
                        />
                        <path
                          d="M93.9676 39.0409C96.393 38.4038 97.8424 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8442 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 84.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                          fill="currentColor"
                        />
                      </svg>
                      Loading...
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium dark:text-black text-white dark:bg-white bg-black hover:bg-opacity-80 dark:hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white">
                      Reset
                    </button>
                  )}
                </div>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    {/* <span className="px-2 bg-gray-50 dark:bg-black text-gray-900 dark:text-white font-medium">
                      Or
                    </span> */}
                  </div>
                </div>

                {/* <div className="mt-6">
                  <div>
                    <button className="w-full inline-flex justify-center items-center py-2 px-4 rounded-md shadow-sm bg-black dark:bg-white text-sm font-medium text-white dark:text-black hover:bg-opacity-90 dark:hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white">
                      <BsGoogle className="w-6 h-6" />
                      &nbsp;Sign in with Google
                    </button>
                  </div>
                </div> */}
                <p className="mt-6 text-center text-base font-medium text-gray-900 dark:text-white">
                  Have an account?
                  <Link
                    href="/login"
                    className="text-indigo-500 hover:text-indigo-600 font-medium">
                    &nbsp;&nbsp;Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;