/**
 * #18c (tin 306) — test lib groupInvites (parse response + goi dung
 * endpoint invite). Axios duoc mock, khong goi API that.
 */
import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

import axios from "axios";
import {
  acceptInviteToken,
  createGroupInvite,
  listGroupInvites,
  revokeGroupInvite,
  validateInviteToken,
} from "../src/lib/groupInvites";

const mockedGet = axios.get as unknown as ReturnType<typeof vi.fn>;
const mockedPost = axios.post as unknown as ReturnType<typeof vi.fn>;
const mockedDelete = axios.delete as unknown as ReturnType<typeof vi.fn>;

describe("groupInvites lib (#18c)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("tao link moi: POST dung endpoint, tra token + inviteUrl 1 lan", async () => {
    mockedPost.mockResolvedValueOnce({
      data: {
        code: 201,
        success: true,
        invite: {
          id: 7,
          conversationId: 900,
          conversationName: "Invite Room",
          createdById: "u1",
          expiresAt: "2026-11-19T00:00:00.000Z",
          maxUses: 0,
          usedCount: 0,
          revoked: false,
          createdAt: "2026-11-18T00:00:00.000Z",
          token: "tok-abc",
          inviteUrl: "/invite/tok-abc",
        },
      },
    });
    const inv = await createGroupInvite(900, { expiresInHours: 24 });
    expect(mockedPost).toHaveBeenCalledWith(
      "/messenger/conversations/900/invites",
      { expiresInHours: 24 }
    );
    expect(inv.token).toBe("tok-abc");
    expect(inv.inviteUrl).toBe("/invite/tok-abc");
    expect(inv.conversationName).toBe("Invite Room");
  });

  it("list + thu hoi link moi goi dung endpoint", async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        code: 200,
        success: true,
        invites: [
          {
            id: 7,
            conversationId: 900,
            createdById: "u1",
            expiresAt: null,
            maxUses: 1,
            usedCount: 1,
            revoked: false,
            createdAt: null,
          },
        ],
      },
    });
    const rows = await listGroupInvites(900);
    expect(mockedGet).toHaveBeenCalledWith(
      "/messenger/conversations/900/invites"
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].usedCount).toBe(1);

    mockedDelete.mockResolvedValueOnce({ data: { code: 200, success: true } });
    await revokeGroupInvite(900, 7);
    expect(mockedDelete).toHaveBeenCalledWith(
      "/messenger/conversations/900/invites/7"
    );
  });

  it("validate tra valid + ten nhom; link hong tra valid=false", async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        code: 200,
        success: true,
        valid: true,
        invite: {
          id: 7,
          conversationId: 900,
          conversationName: "Invite Room",
          createdById: "u1",
          createdBy: { id: "u1", username: "alice" },
          expiresAt: null,
          maxUses: 0,
          usedCount: 0,
          revoked: false,
          createdAt: null,
          usesLeft: null,
        },
      },
    });
    const ok = await validateInviteToken("tok-abc");
    expect(mockedGet).toHaveBeenCalledWith("/messenger/invites/tok-abc");
    expect(ok.valid).toBe(true);
    expect(ok.invite?.conversationName).toBe("Invite Room");
    expect(ok.invite?.createdBy?.username).toBe("alice");

    mockedGet.mockResolvedValueOnce({
      data: {
        code: 410,
        success: false,
        valid: false,
        message: "Invite link has expired",
      },
    });
    const bad = await validateInviteToken("tok-old");
    expect(bad.valid).toBe(false);
    expect(bad.message).toBe("Invite link has expired");
  });

  it("accept goi POST /invites/:token/accept va tra conversationId", async () => {
    mockedPost.mockResolvedValueOnce({
      data: {
        code: 200,
        success: true,
        alreadyMember: false,
        conversation: { id: 900 },
      },
    });
    const res = await acceptInviteToken("tok-abc");
    expect(mockedPost).toHaveBeenCalledWith(
      "/messenger/invites/tok-abc/accept"
    );
    expect(res.alreadyMember).toBe(false);
    expect(res.conversationId).toBe(900);
  });
});
