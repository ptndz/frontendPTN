import React, { useState } from "react";
import { toast } from "react-toastify";
import { followUser, unfollowUser } from "../../lib/social";
import { useI18n } from "../../i18n/I18nProvider";

interface IProps {
  userId: string;
  /** Trạng thái ban đầu (từ follow-status hoặc isFollowing của user). */
  initialFollowing?: boolean;
  onChange?: (following: boolean) => void;
  className?: string;
}

/**
 * P4.1 — Nút Theo dõi / Đang theo dõi. Dùng ở trang cá nhân, kết quả
 * tìm kiếm, trang khám phá và danh sách follower/following.
 */
const FollowButton: React.FC<IProps> = ({
  userId,
  initialFollowing = false,
  onChange,
  className = "text-xs",
}) => {
  const [following, setFollowing] = useState(initialFollowing);
  const [busy, setBusy] = useState(false);
  const { t } = useI18n();

  // Đồng bộ khi props đổi (vd mở modal khác user).
  React.useEffect(() => {
    setFollowing(initialFollowing);
  }, [initialFollowing, userId]);

  const handleClick = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = following
        ? await unfollowUser(userId)
        : await followUser(userId);
      setFollowing(res.following);
      onChange?.(res.following);
    } catch {
      toast.error(t("follow.actionFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      className={`${
        following ? "btn-secondary" : "btn-primary"
      } ${className} disabled:opacity-50`}>
      {following ? t("follow.following") : t("follow.follow")}
    </button>
  );
};

export default FollowButton;
