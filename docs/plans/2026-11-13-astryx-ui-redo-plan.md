# Plan — Redo toàn bộ UI frontendPTN bằng Astryx (sửa từng trang một)

Ngày: 2026-11-13. Trạng thái: **Astryx đã cài xong (bước 0), plan này là bước thực thi**.
Người ra lệnh: cài https://github.com/meta/astryx vào để sửa lại toàn bộ UI của FE, lên plan sửa từng trang một.

## 0. Astryx là gì (đã kiểm chứng)

- Design system mã nguồn mở của Meta, **đang Beta**, MIT, 27k stars, 7.727 commits.
- React 19+ + StyleX; 174 component (bản 0.7.15 đã cài), 7 theme sẵn
  (neutral, butter, chocolate, matcha, stone, gothic, y2k), dark mode, CLI.
- Cài bằng npm thường, không cần build plugin. Override bằng `className`
  (Tailwind / CSS modules / CSS thường) — không lock-in styling.
- Gói đã cài vào frontendPTN: `@astryxdesign/core ^0.7.15`,
  `@astryxdesign/theme-neutral ^0.7.15`, `@stylexjs/stylex ^0.19.2`,
  `@astryxdesign/cli ^0.7.15` (dev). Lệnh: `pnpm exec astryx <cmd>`
  (script `pnpm astryx` đã thêm vào package.json).

## 1. Điểm xuất phát (đã xong — bước 0)

- `src/styles/globals.css`: thêm dòng `@layer reset, theme, base, astryx-base,
  astryx-theme, components, utilities;` **trên** `@import "tailwindcss"`, rồi
  3 file CSS Astryx (`reset.css`, `astryx.css`, `theme-neutral/theme.css`).
  Theo đúng recipe "app đã dùng Tailwind" của CLI — **cố tình KHÔNG lấy
  `tailwind-theme.css`**, vì nó remap các class Tailwind sẵn có của app
  (`rounded-lg`, `shadow-md`, …) sang token Astryx.
- `src/pages/_app.tsx` (Pages Router — app này không dùng App Router):
  bọc toàn app trong `<AstryxTheme theme={neutralTheme}>` +
  `<LinkProvider component={Link}>` (alias `AstryxTheme` vì trùng tên
  `Theme` của react-toastify — đã sửa, tsc pass).
- `pnpm exec astryx init`: tạo `AGENTS.md` trong frontendPTN (index 174
  component + workflow + rules của Astryx). `pnpm exec astryx doctor`:
  **11/11 pass, 0 warn, 0 fail**.
- Kiểm chứng bước 0 (trên VM này): `tsc --noEmit` pass (0 lỗi),
  `vitest` **44/44 pass**, `next build` compile xong trong 45s.
  **Build trên VM bị kẹt ở "Collecting page data" ~7 phút, không ghi thêm
  file nào vào `.next`, process chính ở trạng thái Sleeping — đã kill.
  Nguyên nhân chưa rõ (không phải do fetch backend: `getStaticPaths`
  có try/catch và curl tới backend fail nhanh; nghi worker của Next.js
  bị kẹt trên VM yếu). Build đầy đủ sẽ kiểm chứng lại trên nam, nơi
  backend chạy và máy mạnh hơn — nếu trên nam cũng kẹt thì mới là tín
  hiệu về Astryx.
- Repo clone `~/workspace/code/astryx` (tham khảo) chưa xong — không cần
  cho plan này (gói npm + CLI đã đủ).

## 2. Nguyên tắc (không đổi trong mọi trang)

- **Không đổi behavior / API / route / i18n.** Chỉ đổi UI: component,
  layout, token, spacing. Mọi call GraphQL/REST/Socket giữ nguyên.
- Tuân `frontendPTN/AGENTS.md` (Astryx): bắt đầu mỗi trang từ template
  (`astryx build "<idea>"` → `astryx template <name> <path>`); trang đã có
  thì giữ lại, thêm block/component vào trong các section của nó.
  Đọc `astryx component <Name>` lấy props trước khi dùng.
- **Không `<div>`** — layout/spacing do component đảm nhiệm. Style bằng
  props của component trước, rồi Tailwind utility backed by token.
  **Không hex/px thô, không `style={{…}}`, không `@apply` / `.css` import.**
- Dense data = rows (`Table`, `List`/`ListItem`), không bọc Card.
  `Badge` chỉ dùng cho số đếm.
- **Màu đi qua theme, không `:root` override.** (Xem §3 — đây là quyết
  định lớn nhất của plan.)
- Trước khi giao mỗi đợt build: chạy `astryx doctor --built <dir>` —
  fail thì không giao.
- Mỗi trang (hoặc cụm trang) xong: `tsc` + `pnpm build` + `vitest` pass,
  rồi **sync hash-verified lên nam + rebuild trên nam + kiểm chứng** mới
  sang trang tiếp theo. Không sửa backend trong plan này.

## 3. Quyết định cần chốt (Phase 0)

### 3.1 Theme: giữ Quiet Switchboard, đổi cách thể hiện

- Hệ hiện tại ("The Quiet Switchboard", xem `DESIGN.md`): stone-blueprint,
  accent `#2456d6`, Onest + JetBrains Mono, dark mode first-class.
- Astryx cấm `:root` override — palette phải đi qua theme. Vì vậy Phase 0
  sẽ **map token Quiet Switchboard sang một Astryx theme**:
  `astryx theme add neutral` (hoặc `theme eject` để fork) rồi override
  token bằng giá trị Quiet Switchboard (paper/surface/ink/muted/line/
  accent/danger/success/warning/presence, cả 2 mode sáng/tối).
  Theme `stone` của Astryx là ứng viên gần nhất nếu muốn đổi hẳn sang
  theme có sẵn — quyết ở Phase 0, trước khi sửa trang đầu tiên.
- Font: Onest + JetBrains Mono giữ nguyên (theme-neutral dùng Figtree
  mặc định — phải override font trong theme, không để Figtree lọt vào).

### 3.2 Dark mode thống nhất

- App hiện dùng `.dark` class + zustand store (`useThemeBootstrap`).
  Astryx `Theme` quản lý light/dark theo cách riêng. Phase 0 phải nối
  2 cơ chế thành 1 (toggle của app điều khiển theme Astryx), nếu không
  component Astryx sẽ sáng trong khi phần còn lại tối (hoặc ngược lại).

### 3.3 Cái gì giữ, cái gì bỏ

- Giữ: Tailwind v4 (utility backed by token), `globals.css` token
  `@theme inline` hiện tại (đã giữ nguyên ở bước 0), i18n, react-query,
  socket, tất cả logic trang.
- Bỏ dần theo từng trang: component tự viết trong `src/components`
  (55 file: Auth, Bookmarked, Dashboard, FriendsCom, Home, Loaders,
  Messages, Share, ads, userProfile) — thay bằng Astryx tương đương;
  `react-toastify` (ToastContainer) → Astryx `Banner`/toast khi tới
  trang dùng nó; `react-modal` / `react-responsive-modal` →
  `Dialog` / `AlertDialog`; `nprogress` giữ nguyên (không thuộc Astryx).
- `tailwind-theme.css` vẫn KHÔNG dùng (lý do ở §1) — trừ khi Phase 0
  chứng minh được nó không đổi nghĩa class hiện có.

## 4. Phase 0 — Nền tảng (làm trước, chặn các trang khác)

| # | Việc | Astryx dùng | Xong khi |
|---|------|-------------|----------|
| 0.1 | Map token Quiet Switchboard → theme Astryx (sáng + tối), font Onest/Mono | `theme add neutral` / `theme eject`, `docs theme`, `docs tokens` | Mọi token DESIGN.md đều có trong theme; không còn `:root` override nào đặt màu Astryx |
| 0.2 | Dark mode: toggle của app điều khiển theme Astryx | `Theme`, `docs theme` | Bật/tắt dark đổi cả component Astryx lẫn phần cũ, cùng lúc |
| 0.3 | App chrome: layout + nav dùng chung | `AppShell`, `Layout` (+Header/Content/Panel/Footer), `TopNav`/`SideNav` (xem `component --list`), `Breadcrumbs` | Mọi trang dùng chung 1 khung, không còn nav tự viết |
| 0.4 | Primitive dùng chung: Button, Avatar, Badge, Card, Heading/Text, Input, Skeleton | `Button`, `Avatar`, `Badge`, `Card`, `Heading`, `Text`, `InputGroup`, `Skeleton`/`Spinner` | Có 1 bộ primitive thay thế, mọi trang sau dùng nó |
| 0.5 | Modal + toast dùng chung | `Dialog`, `AlertDialog`, `Banner` | Xóa `react-modal`/`react-responsive-modal`/`react-toastify` khỏi các trang đã sửa |
| 0.6 | Kiểm chứng nền tảng | `tsc`, `pnpm build`, `vitest`, `astryx doctor --built` | Pass hết + sync nam + screenshot feed/login sáng + tối |

## 5. Sửa từng trang (thứ tự ưu tiên)

Mỗi trang: `astryx build "<idea>"` → template/block phù hợp → giữ frame/
gap/padding → thay content → self-check AGENTS.md → tsc + build + test +
`doctor --built` → sync nam → screenshot. Không sửa 2 trang cùng lúc.

| Ưu tiên | Trang (file) | Astryx chính | Ghi chú |
|---|---|---|---|
| P1 | Auth: `login.tsx`, `register.tsx`, `forgotpassword.tsx`, `resetpassword/[token].tsx`, `confirmation/[token].tsx` | `FormLayout`, `InputGroup`, `Button`, `Card`, `Banner` (lỗi), `Link` | Vào/ra đầu tiên, form đơn giản — làm trước để chốt pattern form + thông báo lỗi |
| P2 | Feed: `index.tsx` + `components/Home/*` | `Layout`, `Card`, `Avatar`, `Button`, `Badge`, `List` | Trang lõi, traffic cao nhất. Composer + PostCard + feed list |
| P3 | Post detail: `post/[uuid].tsx` | `Card`, `Avatar`, `List` (comments), `ButtonGroup` (like/share), `EmptyState` | Comment = List rows, không Card bọc list |
| P4 | Profile: `[username].tsx` + `components/userProfile/*` | `Avatar`, `Card`, `Tabs`/`ButtonGroup`, `Badge`, `Breadcrumbs` | Cover + info + tab bài viết/bạn bè |
| P5 | Messenger: `messenger.tsx` + `components/Messages/*` | **`Chat*` (ChatLayout, ChatMessageList, ChatMessageBubble, ChatComposer, ChatComposerInput, ChatSendButton)** | Phức tạp nhất. Astryx có sẵn bộ Chat — đánh giá kỹ có thay được composer/bubble/list hiện tại không trước khi sửa |
| P6 | Friends: `friends.tsx` + `components/FriendsCom/*` | `List`/`ListItem`, `Avatar`, `Button`, `Tabs` | List bạn bè = rows, không Card bọc list |
| P7 | Groups: `groups/index.tsx`, `groups/[id].tsx` | `Card`, `List`, `AvatarGroup`, `Button` | List group + detail group |
| P8 | Events: `events/index.tsx`, `events/[id].tsx` | `Card`, `List`, `Calendar`/`DateInput`, `Badge` | List event + detail + form tạo event |
| P9 | Marketplace: `marketplace/index.tsx`, `marketplace/[id].tsx` | `Card`, `Grid`, `Pagination`, `EmptyState` | Grid sản phẩm + detail |
| P10 | Pages: `pages/index.tsx`, `pages/[id].tsx` | `Card`, `List`, `Avatar` | List page + detail page |
| P11 | Search + Explore + Hashtag: `search.tsx`, `explore.tsx`, `hashtag/[tag].tsx` | `InputGroup`, `List`, `Card`, `EmptyState` | Kết quả tìm kiếm = rows |
| P12 | Notifications: `notification.tsx` | `List`/`ListItem`, `Badge` (số đếm), `EmptyState` | List thông báo = rows |
| P13 | Settings: `settings/index.tsx` | Template `settings` (`astryx template settings`), `FormLayout`, `Switch`/`CheckboxList`, `InputGroup` | Dùng thẳng template settings của Astryx |
| P14 | Dashboard: `dashboard/index.tsx` + `components/Dashboard/*` | Template `dashboard`, `Table`, `Card`, `Badge` | Dùng template dashboard của Astryx |
| P15 | Bookmarked + 404 + misc: `posts/bookmarked.tsx`, `404.tsx` | `List`, `EmptyState`, `Card` | Cuối cùng, ít traffic nhất |

Các component dùng chung (`components/Auth/*`, `Share/*`, `Loaders/*`,
`ads/*`) sửa cùng trang dùng chúng, không sửa riêng lẻ.

## 6. Rủi ro + câu hỏi mở

- **Astryx đang Beta (0.7.x):** API có thể đổi. Sau mỗi lần bump version
  chạy `astryx upgrade --apply` (codemod) + test lại. Không pin version
  thấp hơn 0.7.15.
- **Quy tắc "No `<div>`":** codebase hiện tại đầy `<div>` + class
  Tailwind arbitrary (`bg-[#...]`, `p-[13px]`). Không rewrite 1 lần —
  mỗi trang sửa thì dọn đúng trang đó (self-check của AGENTS.md).
- **Dark mode** (§3.2) là rủi ro lớn nhất ở Phase 0 — nếu nối không
  được, dừng lại báo user trước khi sửa trang.
- **Chat (P5):** bộ Chat của Astryx có thể không khớp hết behavior
  messenger hiện tại (typing/seen/reaction/reply/edit/unsend, call).
  Đánh giá trước khi sửa; nếu không khớp, giữ composer hiện tại và chỉ
  đổi khung + bubble.
- **Hiệu năng:** 174 component nhưng tree-shaking theo import từng
  component (`@astryxdesign/core/Button`) — build xong kiểm tra First
  Load JS không tăng đáng kể so với hiện tại (~220 kB shared).
- **`.dark` + `@custom-variant`:** globals.css hiện dùng
  `@custom-variant dark (&:where(.dark, .dark *))` — Phase 0 kiểm tra
  nó còn tương thích với cách Astryx Theme bật dark không.

## 7. Tiêu chí xong (toàn plan)

- Mọi trang trong §5 đã sửa xong, mỗi trang: tsc + build + vitest pass,
  `astryx doctor --built` pass, sync nam hash-verified, screenshot
  sáng + tối.
- Không còn component tự viết nào mà Astryx đã có tương đương (trừ
  những cái đã ghi rõ giữ lại ở §3.3).
- `DESIGN.md` cập nhật: ghi Astryx làm nền tảng UI, theme mapping,
  và những gì còn lại của Quiet Switchboard.
- Không đổi behavior/API/route/i18n trong suốt plan; DB và backend
  không động vào.
