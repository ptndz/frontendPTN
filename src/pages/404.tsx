import Link from "next/link";
import { NextSeo } from "next-seo";
import { HiArrowLeft } from "react-icons/hi";

const Error = () => {
  return (
    <>
      <NextSeo title="404 - Page Not Found" canonical="https://phamthanhnam.com/404" />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="space-y-2">
            <h1 className="text-8xl font-bold text-emerald-500">404</h1>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Oops! Page not found
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 h-10 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors"
          >
            <HiArrowLeft className="text-base" />
            Back to Home
          </Link>
        </div>
      </div>
    </>
  );
};

export default Error;
