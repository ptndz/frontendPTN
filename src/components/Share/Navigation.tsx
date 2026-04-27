import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  BsX,
  BsGear,
  BsSun,
  BsChatSquare,
  BsBookmark,
  BsHouse,
  BsMoon,
} from "react-icons/bs";
import { VscListSelection } from "react-icons/vsc";
import { FiUsers, FiLogOut } from "react-icons/fi";
import { MdOutlineNotificationsNone } from "react-icons/md";
import { useStoreUser } from "../../store/user";
import { useStoreTheme } from "../../store/state";
import axios from "axios";
import socket from "../../plugins/socket";
import { logout } from "../../lib/logout";

const topCenterNavlinks = [
  { href: "/", icon: <BsHouse />, label: "Home" },
  { href: "/friends", icon: <FiUsers />, label: "Friends" },
  { href: "/messenger", icon: <BsChatSquare />, label: "Messages" },
  { href: "/posts/bookmarked", icon: <BsBookmark />, label: "Bookmarks" },
];

interface INotion {
  id: number;
  isRead: boolean;
  notification: {
    id: number;
    content: string;
    createAt: string;
    senderID: string;
    url: string;
  };
}

function countUnreadNotifications(notifications: INotion[]) {
  let count = 0;
  for (let i = 0; i < notifications.length; i++) {
    if (!notifications[i].isRead) count++;
  }
  return count;
}

const Navigation = () => {
  const [mounted, setMounted] = useState(false);
  const { user } = useStoreUser();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotion, setIsNotion] = useState(false);
  const closeProfileMenu = () => setIsProfileMenuOpen(false);
  const toggleProfileMenu = () => setIsProfileMenuOpen(!isProfileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const openMobileMenu = () => setIsMobileMenuOpen(true);
  const { theme, setTheme } = useStoreTheme();
  const menuRef = useRef<HTMLDivElement>(null);
  const menuNotionRef = useRef<HTMLDivElement>(null);

  const [listNotion, setListNotion] = useState<INotion[]>();
  const numberNotion = useMemo(
    () => countUnreadNotifications(listNotion ?? []),
    [listNotion]
  );

  const fetchData = useCallback(async () => {
    const res = await axios.get("/notification/all");
    setListNotion(res.data.notifications);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const handler = () => { fetchData(); };
    socket.on("notification", handler);
    return () => { socket.off("notification", handler); };
  }, [fetchData]);

  useEffect(() => {
    if (isProfileMenuOpen || isNotion) {
      document.addEventListener("click", handleClickOutsideMenu);
    } else {
      document.removeEventListener("click", handleClickOutsideMenu);
    }
    return () => { document.removeEventListener("click", handleClickOutsideMenu); };
  }, [isProfileMenuOpen, isNotion]);

  const handleClickOutsideMenu = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsMobileMenuOpen(false);
      setIsProfileMenuOpen(false);
    }
    if (menuNotionRef.current && !menuNotionRef.current.contains(event.target as Node)) {
      setIsNotion(false);
    }
  };

  const readNotion = async (notion: INotion) => {
    const res = await axios.post(`/notification/read/${notion.id}`);
    if (res.data.status) router.push(notion.notification.url);
  };

  useEffect(() => setMounted(true), []);
  const handleLogout = () => logout(router);

  const renderThemeChanger = () => {
    if (!mounted) return null;
    return (
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        title={theme === "dark" ? "Light mode" : "Dark mode"}
      >
        {theme === "dark" ? <BsSun className="text-lg" /> : <BsMoon className="text-lg" />}
      </button>
    );
  };

  return (
    <>
      <header className="bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 sticky top-0 w-full z-40">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14 gap-4">

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={openMobileMenu}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <VscListSelection className="text-xl" />
            </button>
          </div>

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image width={100} height={40} alt="Logo" src="/favicon/logo.png" />
          </Link>

          {/* Center nav */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {topCenterNavlinks.map((navlink, index) => {
              const isActive = navlink.href === router.pathname;
              return (
                <Link
                  href={navlink.href}
                  key={index}
                  title={navlink.label}
                  className={`relative flex items-center justify-center w-11 h-11 rounded-xl text-xl transition-colors ${
                    isActive
                      ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {navlink.icon}
                  {isActive && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1.5">
            {renderThemeChanger()}

            {/* Notifications */}
            <div ref={menuNotionRef} className="relative">
              <button
                onClick={() => setIsNotion(!isNotion)}
                className="relative w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <MdOutlineNotificationsNone className="text-xl" />
                {numberNotion > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                    {numberNotion > 9 ? "9+" : numberNotion}
                  </span>
                )}
              </button>

              <div className={`${isNotion ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-2 pointer-events-none"} transition-all duration-200 absolute right-0 mt-2 w-72 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 z-50 overflow-hidden`}>
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {listNotion?.length ? listNotion.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => readNotion(item)}
                      className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      {!item.isRead && (
                        <span className="mt-1.5 w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                      )}
                      <p className={`text-sm leading-snug ${item.isRead ? "text-gray-400 dark:text-gray-500 pl-5" : "text-gray-700 dark:text-gray-300"}`}>
                        {item.notification.content}
                      </p>
                    </div>
                  )) : (
                    <p className="text-sm text-gray-400 text-center py-6">No notifications</p>
                  )}
                </div>
              </div>
            </div>

            {/* Profile */}
            <div ref={menuRef} className="relative">
              <button
                onClick={toggleProfileMenu}
                className="relative w-9 h-9 rounded-xl overflow-hidden ring-2 ring-transparent hover:ring-emerald-400 transition-all"
              >
                {user?.avatar ? (
                  <Image src={user.avatar} alt={user.fullName} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700" />
                )}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white dark:border-gray-950 rounded-full" />
              </button>

              <div className={`${isProfileMenuOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-2 pointer-events-none"} transition-all duration-200 absolute right-0 mt-2 w-60 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 z-50 overflow-hidden`}>
                <Link
                  href={`/${user?.username}`}
                  onClick={closeProfileMenu}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                    {user?.avatar ? (
                      <Image src={user.avatar} alt={user.fullName} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-700" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{user?.fullName}</p>
                    <p className="text-xs text-gray-400 truncate">View profile</p>
                  </div>
                </Link>

                <div className="border-t border-gray-100 dark:border-gray-800 p-1.5 space-y-0.5">
                  <Link href="/friends" onClick={closeProfileMenu} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <FiUsers className="text-gray-400" /> Friends
                  </Link>
                  <Link href="/messenger" onClick={closeProfileMenu} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <BsChatSquare className="text-gray-400" /> Messenger
                  </Link>
                  {user?.role === "admin" && (
                    <Link href="/dashboard" onClick={closeProfileMenu} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <BsGear className="text-gray-400" /> Dashboard
                    </Link>
                  )}
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 p-1.5">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <FiLogOut /> Log out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu overlay */}
        <div className={`${isMobileMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"} transition-all duration-250 absolute top-0 inset-x-0 z-50 p-3 lg:hidden`}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between p-4">
              <Link href="/">
                <Image src="/favicon/logo.png" width={90} height={36} alt="Logo" />
              </Link>
              <button
                onClick={closeMobileMenu}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <BsX className="text-xl text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            <nav className="p-2 border-t border-gray-100 dark:border-gray-800 space-y-0.5">
              {topCenterNavlinks.map((navlink) => {
                const isActive = router.pathname === navlink.href;
                return (
                  <Link
                    href={navlink.href}
                    key={navlink.label}
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm transition-colors ${
                      isActive
                        ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-medium"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span className="text-xl">{navlink.icon}</span>
                    {navlink.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>
    </>
  );
};

export default Navigation;
