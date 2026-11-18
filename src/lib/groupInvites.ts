import axios from "axios";

/**
 * Invite link vao nhom chat (#18c — tin 306).
 * Backend: POST/GET/DELETE /messenger/conversations/:id/invites (admin),
 * GET /messenger/invites/:token (public validate),
 * POST /messenger/invites/:token/accept (user tu vao nhom).
 */

export interface GroupInviteRow {
  id: number;
  conversationId: number | null;
  conversationName: string | null;
  createdById: string;
  createdBy?: { id: string; username: string | null } | null;
  expiresAt: string | null;
  maxUses: number;
  usedCount: number;
  revoked: boolean;
  createdAt: string | null;
  usesLeft?: number | null;
}

export interface InviteToken extends GroupInviteRow {
  token: string;
  inviteUrl: string;
}

function extractInvite(payload: any): any {
  return payload?.invite ?? payload?.data?.invite ?? payload?.data ?? payload ?? {};
}

function extractInvites(payload: any): any[] {
  if (Array.isArray(payload?.invites)) return payload.invites;
  if (Array.isArray(payload?.data?.invites)) return payload.data.invites;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
}

export async function createGroupInvite(
  conversationId: number,
  opts?: { expiresInHours?: number; maxUses?: number }
): Promise<InviteToken> {
  const res = await axios.post(
    `/messenger/conversations/${conversationId}/invites`,
    opts ?? {}
  );
  const inv = extractInvite(res.data);
  return {
    id: inv.id,
    conversationId: inv.conversationId ?? conversationId,
    conversationName: inv.conversationName ?? null,
    createdById: inv.createdById,
    expiresAt: inv.expiresAt ?? null,
    maxUses: inv.maxUses ?? 0,
    usedCount: inv.usedCount ?? 0,
    revoked: Boolean(inv.revoked),
    createdAt: inv.createdAt ?? null,
    token: String(inv.token ?? ""),
    inviteUrl: String(inv.inviteUrl ?? ""),
  };
}

export async function listGroupInvites(
  conversationId: number
): Promise<GroupInviteRow[]> {
  const res = await axios.get(
    `/messenger/conversations/${conversationId}/invites`
  );
  return extractInvites(res.data).map((inv: any) => ({
    id: inv.id,
    conversationId: inv.conversationId ?? conversationId,
    conversationName: inv.conversationName ?? null,
    createdById: inv.createdById,
    expiresAt: inv.expiresAt ?? null,
    maxUses: inv.maxUses ?? 0,
    usedCount: inv.usedCount ?? 0,
    revoked: Boolean(inv.revoked),
    createdAt: inv.createdAt ?? null,
  }));
}

export async function revokeGroupInvite(
  conversationId: number,
  inviteId: number
): Promise<void> {
  await axios.delete(
    `/messenger/conversations/${conversationId}/invites/${inviteId}`
  );
}

export async function validateInviteToken(
  token: string
): Promise<{ valid: boolean; invite: GroupInviteRow | null; message?: string }> {
  const res = await axios.get(`/messenger/invites/${token}`);
  const data = res.data ?? {};
  if (data.valid !== true) {
    return {
      valid: false,
      invite: null,
      message: String(data.message ?? "Invite link khong hop le"),
    };
  }
  const inv = extractInvite(data);
  return {
    valid: true,
    invite: {
      id: inv.id,
      conversationId: inv.conversationId ?? null,
      conversationName: inv.conversationName ?? null,
      createdById: inv.createdById,
      createdBy: inv.createdBy ?? null,
      expiresAt: inv.expiresAt ?? null,
      maxUses: inv.maxUses ?? 0,
      usedCount: inv.usedCount ?? 0,
      revoked: Boolean(inv.revoked),
      createdAt: inv.createdAt ?? null,
      usesLeft: inv.usesLeft ?? null,
    },
  };
}

export async function acceptInviteToken(
  token: string
): Promise<{ alreadyMember: boolean; conversationId: number | null }> {
  const res = await axios.post(`/messenger/invites/${token}/accept`);
  const data = res.data ?? {};
  const conv = data.conversation ?? data.data?.conversation ?? {};
  return {
    alreadyMember: Boolean(data.alreadyMember),
    conversationId:
      typeof conv.id === "number" ? conv.id : data.conversationId ?? null,
  };
}
