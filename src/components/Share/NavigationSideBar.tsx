import Link from "next/link";
import React from "react";
import {
  FiHome,
  FiAward,
  FiGlobe,
  FiZap,
  FiUser,
  FiInbox,
  FiMapPin,
  FiVideo,
  FiSettings,
  FiPieChart,
  FiMessageSquare,
  FiLogOut,
} from "react-icons/fi";

interface NavItem {
  href?: string;
  icon: React.ReactNode;
  label: string;
  iconBg?: string;
  iconColor?: string;
}

const NavSection = ({ title, items }: { title: string; items: NavItem[] }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-3">
    <p className="px-2 py-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
      {title}
    </p>
    <ul className="space-y-0.5">
      {items.map((item, i) => {
        const content = (
          <span className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer transition-colors">
            <span
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                item.iconBg || "bg-gray-100 dark:bg-gray-800"
              } ${item.iconColor || "text-gray-500"}`}
            >
              {item.icon}
            </span>
            {item.label}
          </span>
        );
        return (
          <li key={i}>
            {item.href ? <Link href={item.href}>{content}</Link> : content}
          </li>
        );
      })}
    </ul>
  </div>
);

const NavigationSideBar = () => {
  return (
    <div className="space-y-4">
      <NavSection
        title="New Feeds"
        items={[
          { href: "/", icon: <FiHome className="w-4 h-4" />, label: "News Feed", iconBg: "bg-emerald-50 dark:bg-emerald-950/40", iconColor: "text-emerald-500" },
          { icon: <FiAward className="w-4 h-4" />, label: "Badges", iconBg: "bg-rose-50 dark:bg-rose-950/40", iconColor: "text-rose-500" },
          { icon: <FiGlobe className="w-4 h-4" />, label: "Explore Stories", iconBg: "bg-amber-50 dark:bg-amber-950/40", iconColor: "text-amber-500" },
          { icon: <FiZap className="w-4 h-4" />, label: "Popular Groups", iconBg: "bg-violet-50 dark:bg-violet-950/40", iconColor: "text-violet-500" },
          { href: "/profile", icon: <FiUser className="w-4 h-4" />, label: "Author Profile", iconBg: "bg-sky-50 dark:bg-sky-950/40", iconColor: "text-sky-500" },
        ]}
      />
      <NavSection
        title="More pages"
        items={[
          { icon: <FiInbox className="w-4 h-4" />, label: "Email Box" },
          { icon: <FiHome className="w-4 h-4" />, label: "Near Hotel" },
          { icon: <FiMapPin className="w-4 h-4" />, label: "Latest Event" },
          { icon: <FiVideo className="w-4 h-4" />, label: "Live Stream" },
        ]}
      />
      <NavSection
        title="Account"
        items={[
          { icon: <FiSettings className="w-4 h-4" />, label: "Settings" },
          { icon: <FiPieChart className="w-4 h-4" />, label: "Analytics" },
          { href: "/messenger", icon: <FiMessageSquare className="w-4 h-4" />, label: "Chat" },
          { icon: <FiLogOut className="w-4 h-4" />, label: "Sign Out", iconBg: "bg-rose-50 dark:bg-rose-950/40", iconColor: "text-rose-500" },
        ]}
      />
    </div>
  );
};

export default NavigationSideBar;
