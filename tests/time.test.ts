import { describe, expect, it } from "vitest";
import moment from "moment";
import "moment/locale/vi";
import { formatRelativeTime } from "../src/lib/time";

// Chạy test này với TZ=Asia/Ho_Chi_Minh (xem package.json) để bắt lỗi
// lệch múi giờ: chuỗi naive của server là giờ UTC, không phải giờ địa
// phương của trình duyệt.
moment.locale("vi");

const iso = (d: Date) => d.toISOString();
const naiveUtc = (d: Date) =>
  d.toISOString().slice(0, 19).replace("T", " ");

describe("formatRelativeTime", () => {
  it("chuỗi ISO có Z vừa tạo -> quá khứ, không phải tương lai", () => {
    const justNow = new Date(Date.now() - 10_000);
    expect(formatRelativeTime(iso(justNow))).toBe("vài giây trước");
  });

  it("chuỗi naive kiểu MySQL (giờ UTC) vừa tạo -> quá khứ, kể cả ở TZ +07", () => {
    const justNow = new Date(Date.now() - 10_000);
    // moment() thuần sẽ hiểu naive là giờ địa phương -> ở +07 thành
    // "7 giờ trước". Helper phải hiểu là UTC -> "vài giây trước".
    expect(formatRelativeTime(naiveUtc(justNow))).toBe("vài giây trước");
    expect(formatRelativeTime(naiveUtc(justNow).replace(" ", "T"))).toBe(
      "vài giây trước"
    );
  });

  it("bài 2 giờ trước -> '2 giờ trước', không lệch 7h", () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    expect(formatRelativeTime(iso(twoHoursAgo))).toBe("2 giờ trước");
    expect(formatRelativeTime(naiveUtc(twoHoursAgo))).toBe("2 giờ trước");
  });

  it("chuỗi ISO có offset +07:00 -> parse đúng", () => {
    const justNow = new Date(Date.now() - 10_000);
    const withOffset = moment(justNow).utcOffset(7).format();
    expect(formatRelativeTime(withOffset)).toBe("vài giây trước");
  });

  it("Date object và giá trị rỗng", () => {
    expect(formatRelativeTime(new Date(Date.now() - 10_000))).toBe(
      "vài giây trước"
    );
    expect(formatRelativeTime(null)).toBe("");
    expect(formatRelativeTime(undefined)).toBe("");
    expect(formatRelativeTime("")).toBe("");
  });
});
