import React from "react";
import { TiTick } from "react-icons/ti";

/**
 * Tick xanh xác minh (P3.4). Hiện khi user.verified === true.
 * Dùng cùng icon TiTick mà trang cá nhân đã chuẩn bị sẵn (trước đây bị
 * comment lại) để UI nhất quán.
 */
const VerifiedBadge: React.FC<{ verified?: boolean | null; title?: string }> = ({
  verified,
  title = "Tài khoản đã xác minh",
}) => {
  if (!verified) return null;
  return (
    <span className="inline-flex items-center align-middle" title={title}>
      <TiTick className="text-[18px] text-accent-ink rounded-full bg-accent inline-block" />
    </span>
  );
};

export default VerifiedBadge;
