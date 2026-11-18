import axios from "axios";

/**
 * Admin user management (#18c): dung lai API backend
 * GET /users, GET /roles, PATCH /users/:id/role, PATCH /users/:id/status,
 * DELETE /users/:id (xoa mem).
 */

export interface AdminUserRow {
  id: string;
  username: string;
  name?: string | null;
  fullName?: string | null;
  avatar?: string | null;
  status?: string | null;
  isBot?: boolean;
  role_id?: string | null;
}

export interface AdminRole {
  id: string;
  name: string;
}

function extractItems(payload: any): AdminUserRow[] {
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload)) return payload;
  return [];
}

export async function listAdminUsers(
  page = 1,
  limit = 20
): Promise<{ users: AdminUserRow[]; total: number; lastPage: number }> {
  const res = await axios.get("/users", { params: { page, limit } });
  const data = res.data?.data ?? {};
  const users = extractItems(res.data);
  return {
    users,
    total: typeof data.total === "number" ? data.total : users.length,
    lastPage: typeof data.last_page === "number" ? data.last_page : 1,
  };
}

export async function listRoles(): Promise<AdminRole[]> {
  const res = await axios.get("/roles");
  const arr = Array.isArray(res.data?.data) ? res.data.data : [];
  return arr.map((r: any) => ({
    id: String(r.id),
    name: String(r.name ?? r.id),
  }));
}

export async function patchUserRole(id: string, roleId: string): Promise<void> {
  await axios.patch(`/users/${id}/role`, { roleId });
}

/**
 * Xoa mem user (#18c — tin 306): DELETE /users/:id, backend set status
 * Banned + thu hoi phien + roi nhom + an bai. Khong xoa cung.
 */
export async function deleteUser(id: string): Promise<void> {
  await axios.delete(`/users/${id}`);
}

export async function patchUserStatus(
  id: string,
  status: "Active" | "Suspended" | "Banned"
): Promise<void> {
  await axios.patch(`/users/${id}/status`, { status });
}
