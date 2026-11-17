# Quy trình làm việc — MXH × Otter

Tài liệu này là bản ghi quy trình làm việc chung giữa Nam, Nyx và Antigravity
trên MXH. Ai đọc cũng làm theo được — từ giao việc tới xong việc.

> Bản trong app (nút **Quy trình** ở trang Tin nhắn) là bản rút gọn của tài
> liệu này, lấy từ i18n `workflow` (vi/en). Sửa quy trình thì sửa cả hai chỗ
> cho khớp. Quy trình trao đổi Nyx↔Antigravity chi tiết hơn nằm ở mục 7
> trong `~/workspace/mxh-codeweb-protocol-integration.md` (thư mục
> `MUSE_EXCHANGE/` + `INDEX.md`, đồng bộ task qua API MXH).

## 1. Việc đi từ đâu tới đâu

- Giao việc: gõ `/task <tiêu đề>` trong nhóm chat, hoặc bấm “Tạo task” trên
  bảng Trello.
- Task mới vào cột “Cần làm”, có người nhận (hoặc “Chưa giao”).
- Người nhận mở việc → kéo sang “Đang làm”; xong việc → kéo sang “Xong”
  hoặc gõ `/done <id>`.
- Bot nhắn xác nhận vào nhóm chat khi task được tạo và khi xong.

## 2. Lệnh nhanh trong nhóm chat

- `/task <tiêu đề>` — tạo task mới.
- `/tasks` — xem task của nhóm.
- `/done <id>` — đánh dấu task xong.
- `/help` — xem danh sách lệnh.
- `/info` — xem thông tin nhóm.

Gõ `/` trong khung chat sẽ hiện bảng gợi ý; chọn lệnh rồi gửi như tin
thường — Bot Client của daemon đọc và xử lý, không xử lý ở frontend.

## 3. Ai làm gì

- **Nam** — giao việc, quyết định, kiểm tra kết quả.
- **Nyx** — làm giao diện MXH (bảng Trello, menu Dự án, lệnh nhanh) và nền
  tảng task/bot.
- **Antigravity** — chạy daemon Otter: Bot Client nghe nhóm chat, BotRouter
  gửi tin, tự đổi trạng thái task khi xong.
- Tài khoản bot `ai_nyx`, `ai_antigravity`, `ai_chatgpt` — thành viên nhóm
  chat, có nhãn `[BOT AI]`.

## 4. Kênh nào dùng khi nào

- **Nhóm chat** — nói chuyện nhanh, giao việc bằng lệnh (vài giây).
- **Bảng Trello (/projects)** — xem trạng thái thật của task, kéo-thả đổi
  trạng thái.
- **File trao đổi (thư mục `MUSE_EXCHANGE/` + `INDEX.md`)** — ghi quyết định
  và việc lớn, không copy toàn bộ chat.

## 5. Quy tắc đồng bộ

- Trạng thái task lấy từ MXH (bảng `project_tasks`) — đó là nguồn đúng nhất.
- Đổi trạng thái thì gọi API (kéo-thả trên bảng, lệnh `/done`, hoặc daemon
  tự PATCH).
- Đọc `INDEX.md` trước khi đọc file task chi tiết — đỡ tốn lượt đọc.

## 6. Quản lý task và dự án trên giao diện

- Trang **Dự án** (`/projects`): mỗi nhóm chat là một dự án; bấm “Mở bảng”
  vào board; quản trị viên nhóm bấm “Đổi tên” để đổi tên dự án; bấm
  “Tạo dự án” để tạo nhóm chat mới (cần chọn ít nhất 2 thành viên khác).
- Trên **board** (`/projects/:id/tasks`): bấm “Tạo task” để tạo task tay
  (tiêu đề + người nhận); bấm nút sửa trên thẻ task để đổi tiêu đề, người
  nhận, trạng thái; kéo-thả thẻ sang cột khác để đổi trạng thái.
- Chưa hỗ trợ: xóa task, xóa dự án (chưa có API backend — cần thêm
  `DELETE /messenger/projects/:conversationId/tasks/:id` và
  `DELETE /messenger/conversations/:id` trước đã).
