import React from "react";

/**
 * Logo mới (2026-11-14) — monogram "P" hình học vẽ bằng một nét liền
 * duy nhất, đen/trắng theo theme Mono (currentColor = text-ink nên tự
 * đảo trắng ở dark mode, không còn màu xanh của logo cũ).
 *
 * - Mark: đường P `M20 50V14h13a11 11 0 0 1 0 22H20`, stroke 10/64,
 *   đầu/bó tròn — đọc được từ 16px (favicon) tới cỡ lớn (auth).
 * - Wordmark: chữ "PHAM THANH NAM" (Onest bold, tracking rộng), chỉ
 *   hiện khi showWordmark.
 * - Bản tile (ô vuông đen + P trắng) chỉ dùng cho favicon/app icon
 *   (xem public/favicon/logo.svg + logo.png), không dùng trong UI.
 */
type LogoProps = {
  /** Cạnh của mark, px. Header 32, auth 48. */
  size?: number;
  /** Hiện wordmark "PHAM THANH NAM" cạnh mark. */
  showWordmark?: boolean;
  /** Class đầy đủ cho wordmark (mặc định: text-sm ...); vd header
      truyền "hidden ... lg:inline" để chỉ hiện wordmark từ lg. */
  wordmarkClassName?: string;
  className?: string;
};

const Logo = ({
  size = 32,
  showWordmark = false,
  wordmarkClassName,
  className,
}: LogoProps) => {
  return (
    <span
      className={`inline-flex items-center gap-2.5 text-ink ${className ?? ""}`}
      role="img"
      aria-label="Pham Thanh Nam">
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true">
        <path
          d="M20 50V14h13a11 11 0 0 1 0 22H20"
          stroke="currentColor"
          strokeWidth={10}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showWordmark ? (
        <span
          className={
            wordmarkClassName ??
            "whitespace-nowrap text-sm font-bold tracking-widest"
          }>
          PHAM THANH NAM
        </span>
      ) : null}
    </span>
  );
};

export default Logo;
