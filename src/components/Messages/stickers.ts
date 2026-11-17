/**
 * Bộ sticker có sẵn cho chat (P2.3). Không dùng ảnh ngoài hay SDK:
 * sticker là emoji lớn, gửi như tin nhắn type STICKER với nội dung là
 * 1 ký tự emoji — server không cần thay đổi gì thêm.
 */
export interface StickerItem {
  id: string;
  emoji: string;
  label: string;
}

export const STICKER_SET: StickerItem[] = [
  { id: "love", emoji: "😍", label: "Yêu" },
  { id: "haha", emoji: "😂", label: "Cười lớn" },
  { id: "cry", emoji: "😭", label: "Khóc" },
  { id: "angry", emoji: "😡", label: "Giận" },
  { id: "wow", emoji: "😮", label: "Ngạc nhiên" },
  { id: "like", emoji: "👍", label: "Thích" },
  { id: "heart", emoji: "❤️", label: "Tim" },
  { id: "fire", emoji: "🔥", label: "Cháy" },
  { id: "cool", emoji: "😎", label: "Ngầu" },
  { id: "sleep", emoji: "😴", label: "Buồn ngủ" },
  { id: "think", emoji: "🤔", label: "Suy nghĩ" },
  { id: "clap", emoji: "👏", label: "Vỗ tay" },
  { id: "party", emoji: "🎉", label: "Ăn mừng" },
  { id: "gift", emoji: "🎁", label: "Quà" },
  { id: "cake", emoji: "🎂", label: "Bánh" },
  { id: "coffee", emoji: "☕", label: "Cà phê" },
  { id: "ok", emoji: "👌", label: "OK" },
  { id: "pray", emoji: "🙏", label: "Cầu nguyện" },
  { id: "bye", emoji: "👋", label: "Tạm biệt" },
  { id: "kiss", emoji: "😘", label: "Hôn" },
  { id: "sick", emoji: "🤢", label: "Ốm" },
  { id: "star", emoji: "⭐", label: "Sao" },
  { id: "rocket", emoji: "🚀", label: "Tên lửa" },
  { id: "cat", emoji: "🐱", label: "Mèo" },
];

/** Emoji dùng cho reaction tin nhắn (P2.2c). */
export const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "😡"];
