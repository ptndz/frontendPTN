import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import moment from "moment";
import { GetServerSideProps } from "next";
import { User } from "../gql/graphql";
import { getAuthenticatedUser } from "../lib/pages-router-auth";
import Navigation from "../components/Share/Navigation";
import { useStoreUser } from "../store/user";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";
import {
  AppNotification,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  notificationTarget,
  notificationText,
} from "../lib/notifications";
import { useI18n } from "../i18n/I18nProvider";
import { Stack } from "@astryxdesign/core/Stack";
import { HStack } from "@astryxdesign/core/HStack";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Skeleton } from "@astryxdesign/core/Skeleton";
import { Button } from "@astryxdesign/core/Button";
import { Badge } from "@astryxdesign/core/Badge";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@astryxdesign/core/SegmentedControl";
import { List, ListItem } from "@astryxdesign/core/List";
import { Avatar } from "@astryxdesign/core/Avatar";
import { StatusDot } from "@astryxdesign/core/StatusDot";

const DynamicWidgetMessage = dynamic(
  () => import("../components/Messages/WidgetMessage"),
  {
    ssr: false,
  }
);

interface IProps {
  userData: User;
}

const PAGE_SIZE = 20;

const Notification: React.FC<IProps> = ({ userData }) => {
  const { setUser } = useStoreUser();
  const { t, locale } = useI18n();
  const router = useRouter();

  const [items, setItems] = useState<AppNotification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, [setUser, userData]);

  const load = useCallback(
    async (nextPage: number, nextFilter: "all" | "unread") => {
      if (nextPage === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(false);
      try {
        const res = await fetchNotifications({
          page: nextPage,
          limit: PAGE_SIZE,
          filter: nextFilter,
        });
        setItems((prev) =>
          nextPage === 1 ? res.items : [...prev, ...res.items]
        );
        setTotal(res.total);
        setUnreadCount(res.unreadCount);
        setPage(nextPage);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    load(1, filter);
  }, [filter, load]);

  const handleFilter = (next: "all" | "unread") => {
    if (next !== filter) {
      setFilter(next);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success(t("notifications.markedAllRead"));
    } catch (err) {
      toast.error(t("notifications.markFailed"));
    }
  };

  const handleClickItem = async (item: AppNotification) => {
    if (!item.read) {
      try {
        await markNotificationRead(item.id);
      } catch (err) {
        // Điều hướng vẫn diễn ra dù đánh dấu đọc lỗi.
      }
      setItems((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    const target = notificationTarget(item);
    if (target) {
      router.push(target);
    }
  };

  const hasMore = items.length < total;

  if (!userData) {
    return null;
  }

  return (
    <>
      <Navigation />
      <Stack gap={4} className="mx-auto w-full max-w-3xl bg-paper px-2 pt-2">
        <HStack gap={3} hAlign="between" vAlign="center" wrap="wrap">
          <HStack gap={2} vAlign="center">
            <Heading level={2}>{t("notifications.title")}</Heading>
            {unreadCount > 0 && (
              <Badge label={unreadCount} variant="error" />
            )}
          </HStack>
          <Button
            variant="ghost"
            label={t("notifications.markAllRead")}
            isDisabled={unreadCount === 0}
            onClick={handleMarkAllRead}
          />
        </HStack>

        <SegmentedControl
          value={filter}
          onChange={(value) => handleFilter(value as "all" | "unread")}
          label={t("notifications.title")}>
          <SegmentedControlItem
            value="all"
            label={t("notifications.all")}
          />
          <SegmentedControlItem
            value="unread"
            label={
              unreadCount > 0
                ? `${t("notifications.unread")} (${unreadCount})`
                : t("notifications.unread")
            }
          />
        </SegmentedControl>

        {loading ? (
          <Stack gap={3}>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} height={64} />
            ))}
          </Stack>
        ) : error ? (
          <EmptyState
            title={t("notifications.loadFailed")}
            description={t("notifications.loadFailedHint")}
            actions={
              <Button
                variant="primary"
                label={t("notifications.retry")}
                onClick={() => load(1, filter)}
              />
            }
          />
        ) : items.length === 0 ? (
          <EmptyState
            title={
              filter === "unread"
                ? t("notifications.noUnread")
                : t("notifications.noNotifications")
            }
            description={t("notifications.emptyHint")}
          />
        ) : (
          <List hasDividers>
            {items.map((item) => {
              const actor = item.actor;
              return (
                <ListItem
                  key={item.id}
                  align="start"
                  onClick={() => handleClickItem(item)}
                  label={
                    <Text
                      maxLines={2}
                      color={item.read ? "secondary" : "primary"}
                      weight={item.read ? "normal" : "semibold"}>
                      {notificationText(item, locale)}
                    </Text>
                  }
                  description={
                    item.createdAt ? moment(item.createdAt).fromNow() : ""
                  }
                  startContent={
                    <Avatar
                      src={actor?.avatar || "/images/user-avatar.png"}
                      name={
                        actor?.fullName || t("notifications.userFallback")
                      }
                      size={48}
                      tooltip={false}
                    />
                  }
                  endContent={
                    !item.read ? (
                      <StatusDot
                        variant="accent"
                        label={t("notifications.unread")}
                      />
                    ) : undefined
                  }
                />
              );
            })}
          </List>
        )}

        {hasMore && !loading && (
          <HStack hAlign="center">
            <Button
              variant="secondary"
              isLoading={loadingMore}
              label={
                loadingMore
                  ? t("common.loading")
                  : t("notifications.loadMore")
              }
              onClick={() => load(page + 1, filter)}
              className="w-full sm:w-auto"
            />
          </HStack>
        )}
        <DynamicWidgetMessage />
      </Stack>
    </>
  );
};

export default Notification;

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const user = await getAuthenticatedUser(context);

    if (user) {
      return {
        props: {
          userData: user,
        },
      };
    }
  } catch (error) {}

  return {
    redirect: {
      destination: "/login",
      permanent: false,
    },
  };
};
