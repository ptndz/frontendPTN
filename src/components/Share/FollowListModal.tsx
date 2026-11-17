import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  fetchFollowers,
  fetchFollowing,
  FollowUser,
} from "../../lib/social";
import FollowButton from "./FollowButton";
import { useI18n } from "../../i18n/I18nProvider";

interface IProps {
  userId: string;
  kind: "followers" | "following";
  title: string;
  open: boolean;
  onClose: () => void;
  /** Id user đang đăng nhập — ẩn nút follow trên chính hàng của mình. */
  currentUserId?: string;
}

/**
 * P4.1 — Modal danh sách người theo dõi / đang theo dõi.
 * Mở khi bấm vào số follower/following trên trang cá nhân.
 */
const FollowListModal: React.FC<IProps> = ({
  userId,
  kind,
  title,
  open,
  onClose,
  currentUserId,
}) => {
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setError(false);
    setPage(1);
    (kind === "followers" ? fetchFollowers : fetchFollowing)(userId, 1, 20)
      .then((res) => {
        if (cancelled) return;
        setUsers(res.users);
        setTotal(res.total);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, kind, userId]);

  if (!open) return null;

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const res = await (kind === "followers"
        ? fetchFollowers
        : fetchFollowing)(userId, nextPage, 20);
      setUsers((prev) => [...prev, ...res.users]);
      setTotal(res.total);
      setPage(nextPage);
    } catch {
      setError(true);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-20"
      onClick={onClose}>
      <div
        className="card w-full max-w-md max-h-[70vh] flex flex-col p-4"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <h2 className="text-lg font-semibold">
            {title} {total > 0 ? `(${total})` : ""}
          </h2>
          <button
            onClick={onClose}
            className="icon-btn text-xl"
            aria-label={t("common.close")}>
            ✕
          </button>
        </div>
        <div className="overflow-y-auto py-2 space-y-1">
          {loading ? (
            <p className="text-sm text-muted p-3">{t("common.loading")}</p>
          ) : error ? (
            <p className="text-sm text-muted p-3">
              {t("follow.loadFailed")}
            </p>
          ) : users.length === 0 ? (
            <p className="text-sm text-muted p-3">{t("follow.empty")}</p>
          ) : (
            users.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-3 p-2 hover:bg-paper rounded-lg">
                <Link
                  href={`/${u.username}`}
                  onClick={onClose}
                  className="flex items-center gap-3 min-w-0 flex-1">
                  <Image
                    src={u.avatar || "/images/user-avatar.png"}
                    alt={u.fullName}
                    width={40}
                    height={40}
                    className="rounded-full shrink-0"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold truncate">
                      {u.fullName}
                    </span>
                    <span className="block text-xs text-muted truncate">
                      @{u.username}
                      {typeof u.followerCount === "number"
                        ? ` · ${t("follow.followersCount", { count: u.followerCount })}`
                        : ""}
                    </span>
                  </span>
                </Link>
                {u.id !== currentUserId && (
                  <FollowButton
                    userId={u.id}
                    initialFollowing={u.isFollowing}
                  />
                )}
              </div>
            ))
          )}
        </div>
        {users.length > 0 && users.length < total && (
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="btn-secondary w-full mt-2 disabled:opacity-50">
            {loadingMore ? t("common.loading") : t("feed.loadMore")}
          </button>
        )}
      </div>
    </div>
  );
};

export default FollowListModal;
