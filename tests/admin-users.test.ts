/**
 * #18c — test lib adminUsers (parse response GET /users, GET /roles
 * va goi dung PATCH role/status). Axios duoc mock, khong goi API that.
 */
import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import axios from "axios";
import {
  deleteUser,
  listAdminUsers,
  listRoles,
  patchUserRole,
  patchUserStatus,
} from "../src/lib/adminUsers";

const mockedGet = axios.get as unknown as ReturnType<typeof vi.fn>;
const mockedPatch = axios.patch as unknown as ReturnType<typeof vi.fn>;
const mockedDelete = axios.delete as unknown as ReturnType<typeof vi.fn>;

describe("adminUsers lib (#18c)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("parse GET /users dang Pagination {data:{items,total,last_page}}", async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        code: 200,
        success: true,
        data: {
          items: [
            { id: "u1", username: "alice", status: "Active", role_id: "3" },
            { id: "u2", username: "bob", status: "Suspended", role_id: "2" },
          ],
          total: 2,
          per_page: 20,
          current_page: 1,
          last_page: 1,
        },
      },
    });
    const res = await listAdminUsers(1, 20);
    expect(mockedGet).toHaveBeenCalledWith("/users", {
      params: { page: 1, limit: 20 },
    });
    expect(res.total).toBe(2);
    expect(res.lastPage).toBe(1);
    expect(res.users.map((u) => u.username)).toEqual(["alice", "bob"]);
  });

  it("parse GET /roles dang {data:[...]}", async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        code: 200,
        success: true,
        data: [
          { id: "1", name: "root" },
          { id: "3", name: "user" },
        ],
      },
    });
    const roles = await listRoles();
    expect(mockedGet).toHaveBeenCalledWith("/roles");
    expect(roles).toEqual([
      { id: "1", name: "root" },
      { id: "3", name: "user" },
    ]);
  });

  it("PATCH role/status go dung endpoint + body", async () => {
    mockedPatch.mockResolvedValueOnce({ data: { code: 200, success: true } });
    await patchUserRole("u2", "2");
    expect(mockedPatch).toHaveBeenCalledWith("/users/u2/role", { roleId: "2" });

    mockedPatch.mockResolvedValueOnce({ data: { code: 200, success: true } });
    await patchUserStatus("u2", "Banned");
    expect(mockedPatch).toHaveBeenCalledWith("/users/u2/status", {
      status: "Banned",
    });
  });

  it("DELETE /users/:id goi dung endpoint xoa mem", async () => {
    mockedDelete.mockResolvedValueOnce({ data: { code: 200, success: true } });
    await deleteUser("u2");
    expect(mockedDelete).toHaveBeenCalledWith("/users/u2");
  });
});
