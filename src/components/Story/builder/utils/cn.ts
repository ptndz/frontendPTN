/**
 * cn() cho story builder — thay cho `~/utils/cn` của botbanhang
 * (botbanhang re-export `cn` từ lib/utils = twMerge(clsx(...))).
 * Dùng clsx + tailwind-merge thật để giữ đúng semantics dedup Tailwind.
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export default cn;
