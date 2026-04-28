import Link from "next/link";
import { FaUsers, FaUserAlt } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { BsChatLeftFill, BsFillBookmarkFill } from "react-icons/bs";
import { CgScreen } from "react-icons/cg";
import React from "react";
import Image from "next/image";
import { useStoreUser } from "../../store/user";
import { useRouter } from "next/router";
import { logout } from "../../lib/logout";

const navItems = [
  { href: "/", icon: <CgScreen />, label: "Newsfeed", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
  { href: "/friends", icon: <FaUsers />, label: "Friends", color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/40" },
  { href: "/messenger", icon: <BsChatLeftFill />, label: "Messages", color: "text-sky-500", bg: "bg-sky-50 dark:bg-sky-950/40" },
  { href: "/posts/bookmarked", icon: <BsFillBookmarkFill />, label: "Bookmarks", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/40" },
];

const LeftSideBar = () => {
  const { user } = useStoreUser();
  const router = useRouter();
  const handleLogout = () => logout(router);

  return (
    <div className="space-y-3 py-4">
      {/* Profile card */}
      <Link href={`/${user?.username}`}>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-3 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors cursor-pointer">
          <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0">
            <Image
              src={user?.avatar || "/images/user-avatar.png"}
              alt={user?.fullName || "Avatar"}
              fill
              className="object-cover"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white dark:border-gray-900 rounded-full" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{user?.fullName}</p>
            <p className="text-xs text-gray-400 truncate">@{user?.username}</p>
          </div>
        </div>
      </Link>

      {/* Navigation */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-2">
        <p className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Menu</p>
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = router.pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  isActive
                    ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-medium"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm ${isActive ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400" : `${item.bg} ${item.color}`}`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
          <Link
            href={`/${user?.username}`}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
              router.asPath === `/${user?.username}`
                ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-medium"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-500 text-sm">
              <FaUserAlt />
            </span>
            My Profile
          </Link>
        </nav>
      </div>

      {/* Logout */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-2">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
        >
          <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/40">
            <FiLogOut />
          </span>
          Log out
        </button>
      </div>
    </div>
  );
};

export default LeftSideBar;
