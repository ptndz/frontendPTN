import moment from "moment";

/**
 * Hiển thị thời gian tương đối ("vài giây trước", "7 giờ trước"...).
 *
 * Server lưu DATETIME (UTC) và có thể trả về 2 dạng:
 * - ISO có múi giờ: "2026-11-11T09:47:34.478Z" -> moment parse đúng
 *   ở mọi múi giờ của trình duyệt.
 * - Chuỗi naive kiểu MySQL "2026-11-11 09:47:34" (không có Z/offset):
 *   moment() mặc định hiểu là GIỜ ĐỊA PHƯƠNG của trình duyệt. Với
 *   trình duyệt ở VN (+07) thì bài vừa đăng sẽ lệch đúng 7h — hiển
 *   thị sai quá khứ/tương lai. Vì server lưu UTC nên chuỗi naive
 *   phải được hiểu là UTC (moment.utc).
 */
export function formatRelativeTime(
  value: string | Date | null | undefined
): string {
  if (!value) return "";
  if (value instanceof Date) return moment(value).fromNow();
  const text = String(value).trim();
  if (!text) return "";
  // Chuỗi naive "YYYY-MM-DD HH:mm:ss[.fff]" hoặc "...THH:mm:ss"
  // (không Z, không offset) -> hiểu là UTC.
  if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(text)) {
    return moment.utc(text.replace(" ", "T")).fromNow();
  }
  return moment(text).fromNow();
}
