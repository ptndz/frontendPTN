import { FaUsers, FaUserAlt, FaUserFriends, FaTasks } from "react-icons/fa";
import {
  BsChatLeftFill,
  BsFillBookmarkFill,
} from "react-icons/bs";
import { FiChevronRight } from "react-icons/fi";
import { CgScreen } from "react-icons/cg";
import React from "react";
import Link from "next/link";

import { useStoreUser } from "../../store/user";
import { graphql } from "../../gql";
import { graphQLClient } from "../../plugins/graphql.plugin";
import { useRouter } from "next/router";
import { clearAuthCookies } from "../../lib/auth/session";
import { useI18n } from "../../i18n/I18nProvider";
import { Card } from "@astryxdesign/core/Card";
import { Divider } from "@astryxdesign/core/Divider";
import { List } from "@astryxdesign/core/List";
import { ListItem } from "@astryxdesign/core/List";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Text } from "@astryxdesign/core/Text";
import { HStack } from "@astryxdesign/core/HStack";
import { Stack } from "@astryxdesign/core/Stack";
import { VStack } from "@astryxdesign/core/VStack";

const LeftSideBar = () => {
  const { user } = useStoreUser();
  const { t } = useI18n();
  const router = useRouter();
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
  const quickLinks = [
    {
      href: "/",
      icon: <CgScreen className="bg-accent p-2 w-9 h-9 text-accent-ink rounded-md" />,
      label: t("sidebar.newsfeed"),
    },
    {
      href: "/friends",
      icon: <FaUsers className="bg-danger p-2 w-9 h-9 text-danger-ink rounded-md" />,
      label: t("sidebar.friends"),
    },
    {
      href: "/groups",
      icon: <FaUserFriends className="bg-accent p-2 w-9 h-9 text-accent-ink rounded-md" />,
      label: t("sidebar.groups"),
    },
    {
      href: "/projects",
      icon: <FaTasks className="bg-accent p-2 w-9 h-9 text-accent-ink rounded-md" />,
      label: t("sidebar.projects"),
    },
    {
      href: "/explore",
      icon: <CgScreen className="bg-warning p-2 w-9 h-9 text-ink rounded-md" />,
      label: t("sidebar.explore"),
    },
    {
      href: "/messenger",
      icon: <BsChatLeftFill className="bg-success p-2 w-9 h-9 text-accent-ink rounded-md" />,
      label: t("sidebar.messages"),
    },
    {
      href: "/posts/bookmarked",
      icon: <BsFillBookmarkFill className="bg-accent p-2 w-9 h-9 text-accent-ink rounded-md" />,
      label: t("sidebar.bookmarks"),
    },
    {
      href: `/${user?.username}`,
      icon: <FaUserAlt className="bg-warning p-2 w-9 h-9 text-accent-ink rounded-md" />,
      label: t("sidebar.myProfile"),
    },
  ];
  return (
    <VStack gap={4} className="w-full">
      {/* Card hồ sơ: điểm neo nhận diện ở đầu sidebar trái (link trang
          cá nhân đã có trong Liên kết nhanh — đây chỉ là lối vào gọn). */}
      <Card>
        <Link
          href={`/${user?.username}`}
          className="block rounded-lg hover:bg-paper">
          <HStack gap={3} vAlign="center">
            <Avatar
              src={user?.avatar}
              fallbackSrc="/images/user-avatar.png"
              name={user?.fullName}
              size={48}
              tooltip={false}
            />
            <Stack gap={0} className="min-w-0 flex-1">
              <Text weight="semibold" className="truncate">
                {user?.fullName}
              </Text>
              <Text color="secondary" size="sm" className="truncate">
                @{user?.username}
              </Text>
            </Stack>
            <FiChevronRight className="shrink-0 text-muted" />
          </HStack>
        </Link>
      </Card>
      <Card>
        <VStack gap={3}>
          <Text weight="semibold">{t("sidebar.quickLinks")}</Text>
          <Divider />
          <List>
            {quickLinks.map((link) => (
              <ListItem
                key={link.href}
                href={link.href}
                label={link.label}
                startContent={link.icon}
              />
            ))}
          </List>
        </VStack>
      </Card>

      {/* <div className="bg-white font-medium dark:bg-black p-5 rounded-lg drop-shadow-sm space-y-3">
          <div className="left-sidebar space-y-2">
            <Link href={`/${user?.username}`} passHref>
              <div className="flex items-center gap-2 p-1.5 cursor-pointer">
                <div className="w-10 h-10 rounded-full overflow-hidden relative">
                  {user?.avatar && (
                    <Image
                      alt={user && user.fullName}
                      src={user.avatar || "/images/user-avatar.png"}
                      layout="fill"
                      objectFit="cover"
                    />
                  )}
                </div>
                <p>{user?.fullName}</p>
              </div>
            </Link>
            <Link
              href={`/${user?.username}`}
              className="flex items-center gap-2 hover:bg-paper p-1.5 rounded-md">
              <BsGear className="bg-indigo-400 p-2 w-10 h-10 text-white rounded-md" />
              Settings
            </Link>
            <Link
              href="/messenger"
              className="flex items-center gap-2 hover:bg-paper p-1.5 rounded-md">
              <BsChat className="bg-lime-400 p-2 w-10 h-10 text-white rounded-md" />
              Chat
            </Link>
            <Link
              href="/posts/bookmarked"
              className="flex items-center gap-2 hover:bg-paper p-1.5 rounded-md">
              <BsFillBookmarksFill className="bg-sky-400 p-2 w-10 h-10 text-white rounded-md" />
              Saved posts
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center w-full gap-2 hover:bg-paper p-1.5 rounded-md">
              <FiLogOut className="bg-rose-400 p-2 w-10 h-10 text-white rounded-md" />
              Sign out
            </button>
          </div>
        </div> */}
    </VStack>
  );
};

export default LeftSideBar;
