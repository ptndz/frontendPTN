# i18n Frontend — vi/en (P5b)

Hạ tầng tự làm, **0 dependency mới** (không dùng `next-i18next` / `next-intl`:
repo dùng pages-router, các lib đó đòi sửa `next.config` + bọc mọi page có
`getServerSideProps`, nặng và rủi ro hơn lợi ích). Mặc định **tiếng Việt**,
thêm **tiếng Anh**; đổi ngôn ngữ áp dụng ngay phía client, không reload.

## Dùng thế nào

```tsx
import { useI18n } from "../i18n/I18nProvider";

const { t, locale, setLocale } = useI18n();
t("nav.home"); // "Home"
t("feed.post.comments", { count: 3 }); // "3 Comments" (en) / "3 Comments" (vi)
```

- Key dạng đường dẫn chấm, tra trong `src/i18n/dictionaries.ts`.
- Thiếu key ở locale đang chọn → fallback về `vi`, rồi mới trả về chính key.
- Biến nội suy dạng `{name}`, `{count}`, `{n}`, `{group}`, `{duration}`…
- Thêm key mới: thêm vào **cả `vi` và `en`** — TS ép `en: Dictionary`
  (cùng shape với `vi`), thiếu key là lỗi typecheck.
- **Bản vi giữ text cũ đang hiển thị.** Hai lỗi chính tả cũ
  (`"Wright a comment ..."`, `"loi he thong"`) đã được sửa ngày
  2026-11-11 thành `"Write a comment ..."` / `"Lỗi hệ thống"`.
  Chỉ tách chuỗi ra dictionary, không đổi text vi ngoài các lỗi này.

## Lưu lựa chọn

`localStorage` key `mxh-locale` + cookie cùng tên (max-age 1 năm).
SSR render `vi` trước để không lệch hydration; sau mount mới đọc lựa chọn
đã lưu. Provider đồng bộ `document.documentElement.lang` và
`moment.locale()` để `fromNow()` cũng đổi ngôn ngữ theo.

## Switcher

- `src/components/Share/LanguageSwitcher.tsx` — nút VI | EN, đặt cạnh nút
  đổi theme trên `Navigation` và trong mục Ngôn ngữ ở trang Cài đặt.
- Các màn hình đã chuyển sang `t()` (xem bảng dưới) tự đổi text khi bấm.

## File

| File | Vai trò |
| --- | --- |
| `src/i18n/dictionaries.ts` | Dictionary `vi`/`en` + `lookup`/`interpolate` |
| `src/i18n/I18nProvider.tsx` | `I18nProvider`, `useI18n()` / `useTranslation()` |
| `src/i18n/moment-locale.d.ts` | Khai báo type cho `moment/locale/vi` |
| `src/components/Share/LanguageSwitcher.tsx` | Nút chuyển VI/EN |
| `src/pages/_app.tsx` | Bọc toàn app bằng `I18nProvider` |
| `src/lib/notifications.ts` | `notificationText(n, locale?)` — text thông báo theo locale |

## Độ phủ (2026-11-10, P5b)

Đã chuyển **100% chuỗi UI** trong các màn hình sau:

- **Nav/Sidebar**: `Navigation` (+ dropdown thông báo, menu profile,
  switcher), `NavigationSideBar`, `LeftSideBar`, `RightSideBar`.
- **Feed**: `MiddleLeftBar` (tab Tất cả/Đang theo dõi, Load More),
  `CreatePost`, `SinglePost` (menu, report, reaction, like/comment/share),
  `Comment`, `Comments`, `AddComment`, `Like`, `PollCreator`, `PollCard`,
  `EditPostModal`, `StoryRow` (vòng story + viewer + đăng/xóa story).
- **Auth**: `Login` (gồm bước 2FA), `Register`, `Forgotpassword`,
  `ResetPassword`.
- **Messenger**: `ChatWindow` (cửa sổ nổi), `ChatWidget` (không có chuỗi
  text riêng — chỉ dùng `moment.fromNow()`, đã theo locale qua provider),
  `Chat` (không có chuỗi text), `MessageContent`, trang chính
  `Messages/index.tsx` (typing, seen, gửi media/vị trí/sticker/liên hệ,
  menu đính kèm), `ChatUser` (preview tin nhắn), `GroupChatModal`,
  `GroupMembersPanel`, `MediaGallery`, `CallModal`, `IncomingCallModal`.
- **Trang khác**: `notification` (list + lọc + load more),
  `settings` (riêng tư, đổi mật khẩu, 2FA, thiết bị, chặn, mục Ngôn ngữ).

Chưa chuyển (cố tình / ngoài phạm vi P5b):

- Các trang P1–P4 mới: `groups`, `explore`, `events`, `pages`,
  `marketplace`, `friends`, `search`, `hashtag`, `posts/bookmarked`,
  trang cá nhân `[username]`, `dashboard`, `post/[uuid]` — còn hardcode
  tiếng Việt/Anh lẫn lộn; dictionary đã có sẵn key `nav.*`/`feed.*` để
  các màn này dùng chung khi chuyển tiếp.
- Trang `confirmation`, `404`, `Dashboard`, `FriendsCom`, `userProfile`,
  `Bookmarked`, `ChatUserSearchOffcanvas` (placeholder `"Search"`).
- Text trong comment code, `alt` logo, SEO description dài của trang
  `messenger`, placeholder `"Aa"` của ô chat, nhãn `aria` của reaction
  (`"Press space and after tab key to navigation"`).
  (Chuỗi demo `"Aa@12345678"` trên form Login đã bị xóa ngày 2026-11-11.)
- Text do **backend trả về** (toast message từ GraphQL/REST, nội dung
  thông báo `n.content`) — frontend không dịch được; backend đã có i18n
  vi/en riêng.

## Kiểm chứng

```sh
npx tsc --noEmit   # pass
pnpm build         # pass (cần stub GraphQL ở :8080 vì build chạy qua
                   # env-cmd ghi đè env từ .env.local — xem ghi chú trong
                   # báo cáo P5b; nhớ khôi phục .env.local sau khi build)
```
