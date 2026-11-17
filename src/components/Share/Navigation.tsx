import React, { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import { useRouter } from "next/router";
import {
  BsGear,
  BsSun,
  BsChatSquare,
  BsChevronRight,
  BsBookmark,
  BsHouse,
  BsMoon,
} from "react-icons/bs";
import { VscListSelection } from "react-icons/vsc";
import { FiUsers, FiLogOut, FiCompass } from "react-icons/fi";
import { FaCalendarAlt, FaFlag, FaFolderOpen, FaStore, FaTasks } from "react-icons/fa";
import { MdOutlineNotificationsNone } from "react-icons/md";
import { useStoreUser } from "../../store/user";
import { useStoreTheme } from "../../store/state";
import { graphql } from "../../gql";
import { graphQLClient } from "../../plugins/graphql.plugin";
import socket from "../../plugins/socket";
import { clearAuthCookies } from "../../lib/auth/session";
import { useI18n } from "../../i18n/I18nProvider";
import LanguageSwitcher from "./LanguageSwitcher";
import BottomNav from "./BottomNav";
import moment from "moment";
import {
  AppNotification,
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  notificationTarget,
  notificationText,
} from "../../lib/notifications";
import { TopNav, TopNavItem } from "@astryxdesign/core/TopNav";
import { SideNavItem, SideNavSection } from "@astryxdesign/core/SideNav";
import { MobileNav } from "@astryxdesign/core/MobileNav";
import { DropdownMenu } from "@astryxdesign/core/DropdownMenu";
import { Avatar, AvatarStatusDot } from "@astryxdesign/core/Avatar";
import { Badge } from "@astryxdesign/core/Badge";
import { IconButton } from "@astryxdesign/core/IconButton";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Text } from "@astryxdesign/core/Text";
import { StatusDot } from "@astryxdesign/core/StatusDot";
import { HStack } from "@astryxdesign/core/HStack";
import { Stack } from "@astryxdesign/core/Stack";

const topCenterNavlinks = [
  {
    href: "/",
    icon: <BsHouse />,
    label: "nav.home",
  },
  {
    href: "/friends",
    icon: <FiUsers />,
    label: "nav.friends",
  },
  {
    href: "/messenger",
    icon: <BsChatSquare />,
    label: "nav.messages",
  },
  {
    href: "/posts/bookmarked",
    icon: <BsBookmark />,
    label: "nav.bookmarked",
  },
  {
    href: "/groups",
    icon: <FiUsers />,
    label: "nav.groups",
  },
  {
    href: "/projects",
    icon: <FaTasks />,
    label: "nav.projects",
  },
  {
    href: "/files",
    icon: <FaFolderOpen />,
    label: "nav.files",
  },
  {
    href: "/explore",
    icon: <FiCompass />,
    label: "nav.explore",
  },
  {
    href: "/events",
    icon: <FaCalendarAlt />,
    label: "nav.events",
  },
  {
    href: "/pages",
    icon: <FaFlag />,
    label: "nav.pages",
  },
  {
    href: "/marketplace",
    icon: <FaStore />,
    label: "nav.marketplace",
  },
];
/**
 * Mục nav đang active: khớp chính xác, hoặc là trang con của mục đó
 * (vd /projects/1/tasks vẫn highlight mục /projects; riêng "/" chỉ
 * khớp chính xác để không highlight mọi trang).
 */
const isNavActive = (href: string, pathname: string) =>
  href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);

const Navigation = () => {
  const [mounted, setMounted] = useState(false);

  const { user } = useStoreUser();
  const { t, locale } = useI18n();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotion, setIsNotion] = useState(false);
  const closeProfileMenu = () => setIsProfileMenuOpen(false);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const openMobileMenu = () => setIsMobileMenuOpen(true);
  const { theme, setTheme } = useStoreTheme();

  const [listNotion, setListNotion] = useState<AppNotification[]>();
  const [numberNotion, setNumberNotion] = useState<number>();
  const fetchData = async () => {
    try {
      const [count, list] = await Promise.all([
        fetchUnreadCount().catch(() => null),
        fetchNotifications({ page: 1, limit: 10 }).catch(() => null),
      ]);
      if (list) {
        setListNotion(list.items);
        setNumberNotion(count ?? list.unreadCount);
      } else if (count !== null) {
        setNumberNotion(count);
      }
    } catch (error) {
      // Giữ nguyên badge cũ khi backend chưa trả được.
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  // Ô search trên nav: gõ -> debounce 400ms -> sang /search?q=...
  const [searchInput, setSearchInput] = useState("");
  const searchQuery =
    typeof router.query.q === "string" ? router.query.q : "";
  useEffect(() => {
    if (router.pathname === "/search" && searchQuery !== searchInput) {
      setSearchInput(searchQuery);
    }
    // Chỉ đồng bộ khi ?q= trên URL đổi, không đồng bộ khi đang gõ.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.pathname, searchQuery]);
  useEffect(() => {
    const value = searchInput.trim();
    if (!value || value === searchQuery) return;
    const timer = setTimeout(() => {
      router.push({ pathname: "/search", query: { q: value } });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, searchQuery, router]);

  useEffect(() => {
    socket.on("notification", (data) => {
      fetchData();
    });
  }, []);
  const readNotion = async (notion: AppNotification) => {
    setIsNotion(false);
    if (!notion.read) {
      try {
        await markNotificationRead(notion.id);
      } catch (error) {
        // Điều hướng vẫn diễn ra dù đánh dấu đọc lỗi.
      }
      setListNotion((prev) =>
        prev?.map((n) => (n.id === notion.id ? { ...n, read: true } : n))
      );
      setNumberNotion((prev) => Math.max(0, (prev ?? 1) - 1));
    }
    const target = notificationTarget(notion);
    if (target) {
      router.push(target);
    }
  };
  useEffect(() => setMounted(true), []);

  // Bottom nav (pill nổi, mobile) render cùng Navigation nên chỉ có ở
  // các trang đã đăng nhập; class này cho body chừa padding-bottom dưới
  // lg (xem globals.css) để nội dung không bị pill che. Gỡ khi unmount
  // (sang trang auth) để trang auth không bị thừa khoảng trống.
  useEffect(() => {
    document.body.classList.add("has-bottom-nav");
    return () => {
      document.body.classList.remove("has-bottom-nav");
    };
  }, []);
  const handleLogout = async () => {
    try {
      const queryLogout = graphql(`
        mutation logout {
          logout
        }
      `);
      const res = await graphQLClient.request(queryLogout);
      if (res.logout) {
        clearAuthCookies();
        router.push("/login");
      }
    } catch (error) {
      console.warn(error);
    }
  };
  // Nút đổi theme. Trên mobile (<lg) nó ẩn khỏi TopNav và nằm trong
  // MobileNav (drawer) thay vì chiếm hàng thứ hai của header.
  const renderThemeChanger = (className?: string) => {
    if (!mounted) return null;

    if (theme === "dark") {
      return (
        <IconButton
          label={t("nav.switchToLight")}
          tooltip={t("nav.switchToLight")}
          icon={<BsSun />}
          variant="ghost"
          size="lg"
          className={className}
          onClick={() => setTheme("light")}
        />
      );
    } else {
      return (
        <IconButton
          label={t("nav.switchToDark")}
          tooltip={t("nav.switchToDark")}
          icon={<BsMoon />}
          variant="ghost"
          size="lg"
          className={className}
          onClick={() => setTheme("dark")}
        />
      );
    }
  };

  const hasNotifications = listNotion && listNotion.length > 0;

  return (
    <>
    <header className="bg-surface sm:border-b border-line sticky top-0 w-full z-40">
      {/* Desktop: nội dung header căn giữa theo đúng khung 1560px của
          feed (chỉ có tác dụng khi viewport > 1560px; dưới đó Stack
          rộng 100% như cũ nên mobile không đổi). */}
      <Stack width="100%" maxWidth={1560} className="mx-auto">
      <TopNav
        heading={
          <HStack gap={2} vAlign="center">
            {/* Menu open button */}
            <IconButton
              className="lg:hidden"
              label={t("nav.openMenu")}
              icon={<VscListSelection />}
              variant="ghost"
              size="lg"
              onClick={openMobileMenu}
            />
            {/* Logo mới (2026-11-14): monogram "P" 32px + wordmark chỉ
                từ lg (mobile chỉ mark để header gọn 1 hàng). */}
            <Link href="/" className="relative flex gap-3 items-center">
              <Logo
                size={32}
                showWordmark
                wordmarkClassName="hidden whitespace-nowrap text-sm font-bold tracking-widest lg:inline"
              />
            </Link>
          </HStack>
        }
        startContent={
          <HStack gap={2} vAlign="center">
            {/* Search — gõ rồi debounce 400ms sẽ sang /search?q=... */}
            <HStack className="hidden md:flex" vAlign="center">
              <TextInput
                label={t("nav.searchPlaceholder")}
                isLabelHidden
                type="search"
                enterKeyHint="search"
                startIcon="search"
                value={searchInput}
                onChange={(value) => setSearchInput(value)}
                onEnter={() => {
                  const value = searchInput.trim();
                  if (value && value !== searchQuery) {
                    router.push({
                      pathname: "/search",
                      query: { q: value },
                    });
                  }
                }}
                placeholder={t("nav.searchPlaceholder")}
                containerClassName="w-40 lg:w-56 xl:w-72"
              />
            </HStack>
          </HStack>
        }
        centerContent={
          /* Desktop: 10 icon nav căn giữa thật sự (TopNav 3 vùng) thay
             vì dồn trái sau ô search — thẳng trục với cột feed giữa.
             Dưới lg vẫn ẩn (hidden lg:flex) và nằm trong MobileNav. */
          <HStack gap={1} vAlign="center" className="hidden lg:flex">
            {topCenterNavlinks.map((navlink, index) => (
              <TopNavItem
                key={index}
                href={navlink.href}
                label={t(navlink.label)}
                icon={navlink.icon}
                isIconOnly
                isSelected={isNavActive(navlink.href, router.pathname)}
              />
            ))}
          </HStack>
        }
        endContent={
          <HStack gap={1} vAlign="center">
            {/* theme button — ẩn trên mobile, có trong MobileNav */}
            {renderThemeChanger("hidden lg:inline-flex")}

            {/* P5b — chuyển ngôn ngữ VI/EN, ẩn trên mobile, có trong MobileNav */}
            <LanguageSwitcher className="hidden lg:flex" />

            {/* notifications dropdown */}
            <DropdownMenu
              isMenuOpen={isNotion}
              onOpenChange={setIsNotion}
              menuWidth={320}
              placement="below"
              alignment="end"
              renderTrigger={(triggerProps) => (
                <IconButton
                  {...triggerProps}
                  label={t("notifications.title")}
                  tooltip={t("notifications.title")}
                  variant="ghost"
                  size="lg"
                  icon={
                    <HStack className="relative" vAlign="center">
                      <MdOutlineNotificationsNone className="h-9 w-9" />
                      {numberNotion && numberNotion > 0 ? (
                        <Badge
                          label={numberNotion}
                          variant="error"
                          className="absolute -top-1 -right-1 pointer-events-none"
                        />
                      ) : null}
                    </HStack>
                  }
                />
              )}
              header={
                hasNotifications ? undefined : (
                  <Text color="secondary">{t("nav.noNotifications")}</Text>
                )
              }
              items={
                hasNotifications
                  ? listNotion!.map((item) => ({
                      id: item.id,
                      label: (
                        <Text
                          color={item.read ? "secondary" : "primary"}>
                          {notificationText(item, locale)}
                        </Text>
                      ),
                      description: item.createdAt
                        ? moment(item.createdAt).fromNow()
                        : undefined,
                      icon: (
                        <Avatar
                          src={
                            item.actor?.avatar || "/images/user-avatar.png"
                          }
                          name={
                            item.actor?.fullName ||
                            t("notifications.userFallback")
                          }
                          size={36}
                          tooltip={false}
                        />
                      ),
                      endContent: !item.read ? (
                        <StatusDot
                          variant="accent"
                          label={t("notifications.unread")}
                        />
                      ) : undefined,
                      onClick: () => readNotion(item),
                    }))
                  : []
              }
              footer={
                <Link
                  href="/notification"
                  onClick={() => setIsNotion(false)}
                  className="block rounded-lg p-3 text-center text-sm text-accent-bright hover:bg-paper">
                  {t("nav.viewAllNotifications")}
                </Link>
              }
            />

            {/* profile options */}
            <DropdownMenu
              isMenuOpen={isProfileMenuOpen}
              onOpenChange={setIsProfileMenuOpen}
              menuWidth={256}
              placement="below"
              alignment="end"
              renderTrigger={(triggerProps) => (
                <Avatar
                  {...triggerProps}
                  src={user?.avatar}
                  fallbackSrc="/images/user-avatar.png"
                  name={user?.fullName}
                  size={40}
                  tooltip={false}
                  status={<AvatarStatusDot />}
                />
              )}
              header={
                <Link
                  href={`/${user?.username}`}
                  onClick={closeProfileMenu}
                  className="block rounded-lg p-2 hover:bg-paper">
                  <HStack gap={2} vAlign="center">
                    <Avatar
                      src={user?.avatar}
                      fallbackSrc="/images/user-avatar.png"
                      name={user?.fullName}
                      size={48}
                      tooltip={false}
                    />
                    <Stack gap={0}>
                      <Text>{user?.fullName}</Text>
                      <Text color="secondary" size="sm">
                        {t("nav.seeProfile")}
                      </Text>
                    </Stack>
                  </HStack>
                </Link>
              }
              items={[
                {
                  id: "friends",
                  label: t("nav.friends"),
                  icon: <FiUsers />,
                  href: "/friends",
                  endContent: <BsChevronRight />,
                },
                {
                  id: "messenger",
                  label: t("nav.messenger"),
                  icon: <BsChatSquare />,
                  href: "/messenger",
                  endContent: <BsChevronRight />,
                },
                {
                  id: "files",
                  label: t("nav.files"),
                  icon: <FaFolderOpen />,
                  href: "/files",
                  endContent: <BsChevronRight />,
                },
                {
                  id: "settings",
                  label: t("nav.settings"),
                  icon: <BsGear />,
                  href: "/settings",
                  endContent: <BsChevronRight />,
                },
                ...(user.role === "admin"
                  ? [
                      {
                        id: "dashboard",
                        label: t("nav.dashboard"),
                        icon: <BsGear />,
                        href: "/dashboard",
                        endContent: <BsChevronRight />,
                      },
                    ]
                  : []),
                { type: "divider" as const },
                {
                  id: "logout",
                  label: t("nav.logOut"),
                  icon: <FiLogOut />,
                  variant: "destructive" as const,
                  endContent: <BsChevronRight />,
                  onClick: () => {
                    void handleLogout();
                  },
                },
              ]}
            />
          </HStack>
        }
      />
      </Stack>
      {/* Mobile menu */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
        side="start"
        header={
          <Link href="/" className="relative flex gap-3 items-center">
            <Logo size={32} showWordmark />
          </Link>
        }>
        <SideNavSection title={t("nav.navigation")} isHeaderHidden>
          {topCenterNavlinks.map((navlink) => (
            <SideNavItem
              key={navlink.label}
              label={t(navlink.label)}
              icon={navlink.icon}
              href={navlink.href}
              isSelected={isNavActive(navlink.href, router.pathname)}
              onClick={closeMobileMenu}
            />
          ))}
        </SideNavSection>
        {/* Hàng 2 của header trên mobile (theme + ngôn ngữ) gập vào đây. */}
        <HStack gap={3} vAlign="center" className="px-4 py-3">
          {renderThemeChanger()}
          <LanguageSwitcher />
        </HStack>
      </MobileNav>
    </header>
    {/* Bottom nav pill nổi (mobile, dưới lg) — cùng điều kiện hiển thị
        với top nav: chỉ các trang render Navigation mới có nó. */}
    <BottomNav unreadCount={numberNotion} />
    </>
  );
};

export default Navigation;
