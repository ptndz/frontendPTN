import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { BsHouse, BsChatSquare } from "react-icons/bs";
import { FiUsers } from "react-icons/fi";
import { MdOutlineNotificationsNone } from "react-icons/md";
import { useStoreUser } from "../../store/user";
import { useI18n } from "../../i18n/I18nProvider";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Badge } from "@astryxdesign/core/Badge";
import { HStack } from "@astryxdesign/core/HStack";
import { Icon } from "@astryxdesign/core/Icon";
import { Text } from "@astryxdesign/core/Text";

interface BottomNavProps {
  /** Số thông báo chưa đọc — cùng nguồn với chuông ở top nav
      (Navigation fetch qua fetchUnreadCount, truyền xuống đây). */
  unreadCount?: number;
}

/**
 * Thanh điều hướng dưới cho mobile — Minimalist Monochrome Soft UI,
 * kiểu iOS: thanh DOCKED sát mép dưới màn hình (fixed bottom-0,
 * full-width, không bo tròn, không nổi), viền trên tách khỏi nội dung,
 * nền surface mờ (backdrop-blur). Cao 4rem + safe-area (iPhone home
 * indicator) — nội dung được nâng lên bằng padding-bottom.
 *
 * Chỉ hiện dưới `lg` (`lg:hidden`); chỉ render trên các trang đã có
 * top nav (Navigation render component này ngay sau <header>), nên
 * login / register / forgotpassword / resetpassword / confirmation
 * không bao giờ thấy nó. Top nav + hamburger drawer giữ nguyên.
 *
 * Active state khớp top nav: `bg-accent/10 text-accent-bright`.
 * Nút Cá nhân dẫn tới `/${username}` như link profile ở top nav.
 */
const BottomNav = ({ unreadCount }: BottomNavProps) => {
  const { user } = useStoreUser();
  const { t } = useI18n();
  const router = useRouter();

  const profileHref = user?.username ? `/${user.username}` : "/";
  const isProfileActive =
    router.pathname === "/[username]" &&
    router.query.username === user?.username;

  const items = [
    {
      id: "home",
      href: "/",
      label: t("nav.bottomHome"),
      icon: <Icon icon={BsHouse} size="lg" />,
      isActive: router.pathname === "/",
      badge: undefined as number | undefined,
    },
    {
      id: "friends",
      href: "/friends",
      label: t("nav.bottomFriends"),
      icon: <Icon icon={FiUsers} size="lg" />,
      isActive: router.pathname === "/friends",
      badge: undefined as number | undefined,
    },
    {
      id: "messages",
      href: "/messenger",
      label: t("nav.bottomMessages"),
      icon: <Icon icon={BsChatSquare} size="lg" />,
      isActive: router.pathname === "/messenger",
      badge: undefined as number | undefined,
    },
    {
      id: "notifications",
      href: "/notification",
      label: t("nav.bottomNotifications"),
      icon: <Icon icon={MdOutlineNotificationsNone} size="lg" />,
      isActive: router.pathname === "/notification",
      badge: unreadCount,
    },
    {
      id: "profile",
      href: profileHref,
      label: t("nav.bottomProfile"),
      icon: (
        <Avatar
          src={user?.avatar}
          fallbackSrc="/images/user-avatar.png"
          name={user?.fullName}
          size={24}
          tooltip={false}
          className={isProfileActive ? "ring-2 ring-accent" : undefined}
        />
      ),
      isActive: isProfileActive,
      badge: undefined as number | undefined,
    },
  ];

  return (
    <HStack
      gap={1}
      vAlign="center"
      className="fixed bottom-0 left-0 right-0 z-50 h-[calc(4rem+env(safe-area-inset-bottom))] border-t border-line bg-surface/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          aria-label={item.label}
          aria-current={item.isActive ? "page" : undefined}
          className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-1 py-1.5 ${
            item.isActive
              ? "bg-accent/10 text-accent-bright"
              : "text-muted hover:bg-paper hover:text-ink"
          }`}>
          <HStack className="relative" vAlign="center">
            {item.icon}
            {item.badge && item.badge > 0 ? (
              <Badge
                label={item.badge}
                variant="error"
                className="absolute -top-1 -right-1 pointer-events-none"
              />
            ) : null}
          </HStack>
          <Text size="sm" className="whitespace-nowrap text-xs leading-none">
            {item.label}
          </Text>
        </Link>
      ))}
    </HStack>
  );
};

export default BottomNav;
