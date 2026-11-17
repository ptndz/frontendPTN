# MXH — Plan tính năng còn thiếu

Ngày: 2026-11-10. Trạng thái: plan only, chưa sửa code.
Hai repo: `frontendPTN` (nhánh `pro`, Next.js 15 / React 19 / Tailwind v4, vừa lên pnpm 9)
và `express-example` (nhánh `server`, Express 5 / Apollo 5 / TypeORM 0.3, MySQL + Redis).
Mọi khẳng định "có / không có" bên dưới đều đã kiểm chứng bằng grep trên code hiện tại,
không đoán.

## 1. Hiện trạng đã có (đã kiểm chứng)

- Auth: đăng ký / đăng nhập / quên + reset mật khẩu / xác nhận email, JWT + refresh token.
- Feed: đăng bài chữ + ảnh, bình luận lồng nhau, 6 reaction (LIKE/LOVE/HAHA/WOW/SAD/ANGRY),
  share, bookmark, xóa bài. Trang chi tiết bài SSG.
- Bạn bè: gửi / nhận lời mời, danh sách bạn, gợi ý "you may know".
- Messenger: chat realtime socket.io, nhắn chữ + ảnh, cửa sổ chat nổi + trang messenger đầy đủ.
- Trang cá nhân: xem + sửa (About/Profile modal). Dashboard admin: thống kê user/bài/bạn.
- Nền tảng: PWA + push subscription, AdSense, Analytics, dark mode, file upload (dedup checksum),
  bookmark + tóm tắt link, giả lập Telegram Bot API, dynamic entity engine (JSON → bảng + REST + GraphQL).

## 2. Cái đang hỏng hoặc làm dở (nền cho mọi phase sau)

- Trang `/notification` chỉ là giao diện tĩnh, số "23" hardcode. Backend chỉ có
  `POST /notification/subscription` (đăng ký Web Push) và hàm `sendNotification` /
  `sendNotificationByUser` nhưng **không chỗ nào gọi chúng** khi có like/comment/kết bạn/nhắn tin.
- Nút Report trong bài viết gọi `POST /bookmark/report/:uuid` nhưng backend **không có route
  nào tên report** (grep 0 kết quả) — bấm là lỗi, không tạo report thật.
- Tìm kiếm: chỉ có search trong trang Friends và search user trong chat; ô search trên nav
  không dẫn tới trang kết quả nào. Backend có Meilisearch (index bookmarks) nhưng cron đồng bộ
  đang bị comment, không có API search.
- Token GraphQL frontend bị "đóng băng" lúc import module (đọc cookie một lần rồi gán cứng
  vào header) — sau login/refresh vẫn dùng token cũ tới khi reload trang.
- `graphQLClientErrorCheck` xóa cookie auth với **mọi** lỗi GraphQL không phải `JWT_EXPIRED`,
  kể cả lỗi không liên quan tới auth — user bị văng oan.
- `yarn build` lỗi nếu backend không chạy (`getStaticPaths` của `/post/[uuid]` không try/catch).
- Sidebar đã có mục "Explore Stories" và "Popular Groups" nhưng không có trang hay API nào
  phía sau. `MessageType` có VIDEO/AUDIO/FILE/LOCATION/CONTACT/STICKER nhưng gửi tin chỉ có
  chữ + ảnh. Component `Email/*` và hàm `useGraphQL` là code chết.

## 3. Phase P0 — Sửa cái đang hỏng trước (ưu tiên cao nhất, ~2–3 buổi)

Không thêm tính năng mới. Xong P0 thì những gì đang hiện ra mới chạy thật.

- **P0.1 Thông báo thật.** Backend: entity `Notification` (loại: like/comment/friend_request/
  message/mention, `actorId`, `targetId`, `postId?`, `read`, `createdAt`) + API list/đánh dấu
  đã đọc/đếm chưa đọc + fan-out tạo notification ngay trong service like/comment/kết bạn/nhắn tin
  + gọi `sendNotification` đã có để đẩy Web Push. Frontend: trang `/notification` thật (list,
  lọc chưa đọc, bấm vào đi tới bài/chat), badge số chưa đọc trên nav. Kiểm chứng: like bài →
  chủ bài thấy thông báo trong < 2s, cả khi đang tắt tab (push).
- **P0.2 Report chạy thật.** Backend: entity `Report` (có thể dùng dynamic entity JSON cho nhanh)
  + `POST /reports` + queue cho admin xem. Frontend: nút Report trong bài viết gọi đúng endpoint,
  toast xác nhận thay vì `toast.error("Report")`. Kiểm chứng: report xong admin thấy trong queue.
- **P0.3 Tìm kiếm chạy thật.** Backend: bật lại cron `startSync` Meilisearch, thêm API search
  (bài viết + user + bookmark). Frontend: trang kết quả search từ ô trên nav (debounce, phân trang).
  Kiểm chứng: gõ tên user / từ trong bài → ra kết quả đúng.
- **P0.4 Sửa token GraphQL + lỗi văng auth.** Frontend: đọc token trong mỗi request như Axios
  đang làm (bỏ `aToken` gán cứng ở top-level); `graphQLClientErrorCheck` chỉ xóa cookie khi lỗi
  thật sự liên quan tới auth (401/`UNAUTHENTICATED`/`JWT_EXPIRED`). Kiểm chứng: login xong gọi
  GraphQL không cần reload; lỗi GraphQL thường không văng user.
- **P0.5 Build chịu được khi backend down.** `getStaticPaths` của `/post/[uuid]` bọc try/catch,
  trả `paths: []` khi backend không tới được. Kiểm chứng: tắt backend, `pnpm build` vẫn pass.
- **P0.6 Dọn code chết.** Xóa `Email/*`, `useGraphQL`, `auth.plugin.ts` rỗng. Không đổi behavior.

## 4. Phase P1 — Tính năng mạng xã hội cốt lõi còn thiếu (~4–6 buổi)

- **P1.1 Stories (24h).** Backend: entity `Story` (ảnh/video ngắn, `expiresAt`, lượt xem) + API
  đăng/xem/xóa + cron xóa story hết hạn. Frontend: vòng story trên đầu feed, màn xem story
  (chuyển tiếp/tự động, danh sách người xem), đăng story từ composer. Đây là mục sidebar đã
  quảng cáo sẵn nên làm trước cho đỡ "treo đầu dê".
- **P1.2 Video trong bài + xem video.** Backend: cho upload video (giới hạn dung lượng/thời gian,
  thumbnail), phục vụ có Range như file download đã làm. Frontend: đăng video trong CreatePost,
  trình phát video inline trong feed, trang xem video. Không làm Reels riêng ở phase này.
- **P1.3 Poll (bình chọn) trong bài.** Backend: entity `Poll` + `PollOption` + `PollVote`
  (1 vote/user/option, đổi vote được) — hợp với dynamic entity engine nhưng vote cần logic riêng
  nên làm service tay. Frontend: tạo poll trong composer, vote + xem tỉ lệ trực tiếp.
  (Lưu ý: code/web đã có poll cho chat — tham khảo UX, không copy nguyên vì khác domain.)
- **P1.4 Nhóm (Groups).** Backend: entity `Group` + `GroupMember` (vai trò admin/member, nhóm kín/
  công khai, duyệt thành viên) + feed riêng của nhóm. Frontend: trang tạo/tìm nhóm, trang nhóm
  (feed + thành viên + xin vào), đăng bài vào nhóm. Mục "Popular Groups" trên sidebar có nội dung
  thật sau phase này.
- **P1.5 Sửa bài + quyền xem bài (audience).** Backend: thêm `audience` (public/friends/only-me)
  vào Post + API sửa bài + enforce audience ở mọi chỗ đọc bài (feed, trang chi tiết, search).
  Frontend: menu sửa bài, chọn audience lúc đăng. Kiểm chứng: bài only-me không lọt ra feed
  người khác, kể cả qua search.
- **P1.6 Hashtag + mention.** Backend: parse `#tag`/`@user` lúc tạo bài, entity `Hashtag`,
  API trang hashtag, mention tạo notification (dựa trên P0.1). Frontend: render hashtag/mention
  thành link, trang hashtag, gợi ý mention khi gõ @. Kiểm chứng: bấm hashtag ra đúng các bài có tag.

## 5. Phase P2 — Messenger sâu hơn (~3–4 buổi)

- **P2.1 Nhắn nhóm.** Backend: conversation nhiều thành viên (thêm/xóa thành viên, đổi tên nhóm,
  quyền admin nhóm). Frontend: tạo nhóm chat, hiển thị tên nhóm + avatar gộp.
- **P2.2 Trạng thái + tương tác tin nhắn.** Typing indicator ("đang nhập..."), đã xem (seen),
  reaction cho tin nhắn, trả lời/trích dẫn (reply/quote), sửa/xóa/thu hồi tin nhắn.
  Kiểm chứng theo từng mục nhỏ, không gộp.
- **P2.3 Media trong chat.** Gửi video/audio/file/location/sticker — các type đã khai báo sẵn
  trong `MessageType` nhưng chưa dùng; chỉ cần làm UI gửi + hiển thị + gallery media của đoạn chat.
- **P2.4 Gọi thoại/video trong chat (tùy chọn, cần quyết).** Nặng nhất phase này. Hướng gợi ý:
  tái dùng mediasoup group call đã có sẵn trong dự án `code/web` (đã kiểm chứng live 3 người)
  thay vì làm mới — nhưng đó là Rust backend + signalling riêng, cần một buổi riêng để đánh giá
  tích hợp. Nếu không làm, bỏ mục này khỏi P2 và để dành.

## 6. Phase P3 — An toàn, tin cậy, quản trị (~3–4 buổi)

- **P3.1 Kiểm duyệt.** Dashboard admin: queue report (từ P0.2), ẩn/xóa bài vi phạm, cảnh cáo /
  khóa tài khoản (backend hiện không có API xóa/khóa user — thêm `suspend`, không xóa cứng).
- **P3.2 Chặn + riêng tư.** Chặn user (không thấy bài nhau, không nhắn được), trang Cài đặt /
  Riêng tư (ai được kết bạn / nhắn tin / xem bài), chặn từ trang cá nhân.
- **P3.3 Bảo mật tài khoản.** 2FA TOTP (đăng nhập bước 2), trang "Thiết bị đã đăng nhập" (entity
  `Device` đã có sẵn — chỉ cần hiện ra + thu hồi), đổi mật khẩu yêu cầu mật khẩu cũ.
- **P3.4 Tick xanh (xác minh).** Quy trình xin xác minh + duyệt trong dashboard, hiển thị tick
  trên profile/bài viết. Nhỏ, làm cuối P3.

## 7. Phase P4 — Khám phá & tăng trưởng (tùy chọn, ~4–6 buổi, cần quyết có làm không)

- **P4.1 Follow (theo dõi).** Ngoài model bạn bè hiện tại, thêm follow một chiều cho profile
  công khai + feed "Đang theo dõi". Chỉ làm nếu muốn hướng public figure / creator.
- **P4.2 Trang khám phá / thịnh hành.** Trending hashtag + bài thịnh hành, gợi ý kết bạn mở rộng
  (hiện chỉ có "you may know" cơ bản).
- **P4.3 Events / Pages / Marketplace.** Mỗi cái là một sản phẩm con (tạo event + tham gia,
  Page cho doanh nghiệp, mua bán). **Mặc định: không làm** trừ khi user chỉ định — ghi ở đây
  để không ai tưởng là "còn thiếu nên phải làm".

## 8. Phase P5 — Nền tảng & chất lượng (~2–3 buổi, làm xen kẽ)

- Test: hiện cả hai repo đều **0 test**. Thêm test cho phần quan trọng nhất trước: auth backend,
  `ensureAllowed`, like/comment, messenger socket events.
- Bảo mật (đã biết, chưa sửa): `.env.local` backend đang commit trong git cùng toàn bộ secret —
  gỡ khỏi git + **xoay lại toàn bộ secret**; kiểm chứng nghi vấn path traversal ở download file;
  khóa route tạo entity động chỉ cho admin (hiện user nào đăng nhập cũng tạo được).
- Rate limiting (hiện không có), giới hạn upload (multer không giới hạn dung lượng).
- i18n frontend (backend đã có vi/en, frontend chưa — toàn bộ chuỗi đang hardcode).
- Hiệu năng feed: phân trang đã có, thêm virtualization khi list dài + tối ưu ảnh (đã có `sharp`).

## 9. Thứ tự & ước lượng

Thứ tự khuyên dùng: P0 → P1 → P2 → P3 → (P4 nếu muốn) → P5 xen kẽ.
P0 là tiền đề cho P1.6 (mention cần notification) và P3.1 (cần report). P1.4 Groups là tiền đề
cho P2.1 (nhắn nhóm dùng chung model thành viên). Ước lượng thô cho P0–P3: **12–17 buổi**;
P4 thêm 4–6 buổi nếu làm; P5 làm xen kẽ, không tính riêng thành phase lớn.
Mỗi phase xong đều phải: `tsc` + build pass cả hai repo, sync sang nam hash-verified, và kiểm
chứng tay các tiêu chí "Kiểm chứng" ghi trong từng mục (chưa có test tự động đủ để thay thế).

## 10. Câu hỏi mở (cần user quyết trước khi code)

1. Làm theo thứ tự P0 → P1 → P2 → P3, hay muốn nhảy thẳng tới một tính năng cụ thể
   (vd Stories, Groups) trước?
2. Gọi thoại/video trong chat (P2.4): tái dùng mediasoup từ dự án `code/web`, hay bỏ qua?
3. Events / Pages / Marketplace (P4.3): làm hay không làm?
4. Follow một chiều (P4.1): có muốn không, hay chỉ giữ model bạn bè?
5. Ngôn ngữ giao diện: giữ tiếng Việt như hiện tại, hay làm song ngữ vi/en như backend?
6. Ai kiểm duyệt (P3.1): chỉ admin, hay thêm vai trò moderator?
