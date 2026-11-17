/**
 * P3 — API layer (REST) cho kiểm duyệt / chặn / cài đặt / thiết bị / xác minh / 2FA.
 * Axios đã có baseURL + auth interceptor (src/plugins/axios.plugin.ts).
 */
import axios from "axios";

export interface ReportItem {
  id: number;
  targetType: "post" | "comment" | "user";
  targetId: string;
  reporterId?: string;
  reporter?: { id: string; fullName: string; username: string; avatar?: string | null } | null;
  reason: string;
  status: "open" | "resolved" | "dismissed";
  createdAt?: string | null;
}

export interface VerificationItem {
  id: number;
  userId: string;
  user?: { id: string; fullName: string; username: string; avatar?: string | null } | null;
  reason: string;
  status: "pending" | "approved" | "rejected";
  reviewedById?: string | null;
  createdAt?: string | null;
}

export interface DeviceItem {
  id: number;
  agent: string;
  ip: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface PrivacySettings {
  friendRequestPolicy: "everyone" | "friends-of-friends" | "nobody";
  messagePolicy: "everyone" | "friends";
  defaultAudience: "public" | "friends" | "only-me";
  twoFactorEnabled: boolean;
}

const data = (res: any) => res?.data ?? {};

// ---------------------------------------------------------- P3.1 reports
export async function fetchReports(status = "open"): Promise<ReportItem[]> {
  const res = await axios.get("/reports", { params: { status, limit: 50 } });
  return (data(res).reports ?? []) as ReportItem[];
}

export async function updateReportStatus(
  id: number,
  status: "resolved" | "dismissed"
): Promise<void> {
  await axios.patch(`/reports/${id}`, { status });
}

export async function hideReportedPost(id: number): Promise<void> {
  await axios.post(`/reports/${id}/hide-post`);
}

export async function warnReportedUser(id: number): Promise<void> {
  await axios.post(`/reports/${id}/warn-user`);
}

export async function suspendUser(id: string): Promise<void> {
  await axios.post(`/users/${id}/suspend`);
}

export async function unsuspendUser(id: string): Promise<void> {
  await axios.post(`/users/${id}/unsuspend`);
}

// ---------------------------------------------------------- P3.2 blocks
export async function blockUser(id: string): Promise<void> {
  await axios.post(`/users/${id}/block`);
}

export async function unblockUser(id: string): Promise<void> {
  await axios.post(`/users/${id}/unblock`);
}

export async function getBlockStatus(id: string): Promise<boolean> {
  const res = await axios.get(`/users/${id}/block`);
  return !!data(res).blocked;
}

export async function fetchMyBlocks(): Promise<
  { id: number; blockedId: string; blocked: any }[]
> {
  const res = await axios.get("/users/blocks");
  return (data(res).blocks ?? []) as { id: number; blockedId: string; blocked: any }[];
}

// ---------------------------------------------------------- P3.2 settings
export async function fetchSettings(): Promise<PrivacySettings | null> {
  const res = await axios.get("/settings");
  return (data(res).settings ?? null) as PrivacySettings | null;
}

export async function updateSettings(
  patch: Partial<PrivacySettings>
): Promise<PrivacySettings | null> {
  const res = await axios.put("/settings", patch);
  return (data(res).settings ?? null) as PrivacySettings | null;
}

// ---------------------------------------------------------- P3.3 devices
export async function fetchDevices(): Promise<DeviceItem[]> {
  const res = await axios.get("/devices");
  return (data(res).devices ?? []) as DeviceItem[];
}

export async function revokeDevice(id: number): Promise<void> {
  await axios.delete(`/devices/${id}`);
}

export async function revokeAllDevices(): Promise<void> {
  await axios.post("/devices/revoke-all");
}

// ---------------------------------------------------------- P3.3 password + 2FA
export async function changePassword(
  oldPassword: string,
  newPassword: string
): Promise<void> {
  await axios.post("/auth/change-password", { oldPassword, newPassword });
}

export async function setupTwoFactor(): Promise<{
  secret: string;
  otpauthUrl: string;
}> {
  const res = await axios.post("/auth/2fa/setup");
  return data(res) as { secret: string; otpauthUrl: string };
}

export async function enableTwoFactor(code: string): Promise<string[]> {
  const res = await axios.post("/auth/2fa/enable", { code });
  return (data(res).backupCodes ?? []) as string[];
}

export async function disableTwoFactor(code: string): Promise<void> {
  await axios.post("/auth/2fa/disable", { code });
}

// ---------------------------------------------------------- P3.4 verification
export async function requestVerification(reason: string): Promise<void> {
  await axios.post("/verification/requests", { reason });
}

export async function fetchVerificationRequests(
  status = "pending"
): Promise<VerificationItem[]> {
  const res = await axios.get("/verification/requests", { params: { status } });
  return (data(res).requests ?? []) as VerificationItem[];
}

export async function reviewVerification(
  id: number,
  approve: boolean
): Promise<void> {
  await axios.post(`/verification/requests/${id}/${approve ? "approve" : "reject"}`);
}
