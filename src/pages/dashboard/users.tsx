import Navigation from "../../components/Share/Navigation";
import { useEffect, useMemo, useState } from "react";
import { GetServerSideProps } from "next";
import { User } from "../../gql/graphql";
import { getAuthenticatedUser } from "../../lib/pages-router-auth";
import { toast } from "react-toastify";
import { useI18n } from "../../i18n/I18nProvider";
import {
  deleteUser,
  listAdminUsers,
  listRoles,
  patchUserRole,
  patchUserStatus,
  type AdminRole,
  type AdminUserRow,
} from "../../lib/adminUsers";
import { Stack } from "@astryxdesign/core/Stack";
import { HStack } from "@astryxdesign/core/HStack";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Button } from "@astryxdesign/core/Button";
import { TextInput } from "@astryxdesign/core/TextInput";

interface IProps {
  userData: User;
}

const PAGE_SIZE = 20;
const STATUSES = ["Active", "Suspended", "Banned"] as const;

/**
 * Trang quan ly user cho admin (#18c): list + tim kiem + doi role/status
 * + xoa mem (DELETE /users/:id -> Banned, tin 306).
 * Dung lai API backend GET /users, GET /roles, PATCH /users/:id/role,
 * PATCH /users/:id/status (RBAC + phan cap o backend; chi root duoc gan
 * role dac quyen). Khong co quyen user:list thi hien thong bao.
 */
export default function AdminUsersPage({ userData }: IProps) {
  void userData;
  const { t } = useI18n();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [busyId, setBusyId] = useState("");

  const load = async (p: number) => {
    setLoading(true);
    setForbidden(false);
    try {
      const [u, r] = await Promise.all([listAdminUsers(p, PAGE_SIZE), listRoles()]);
      setUsers(u.users);
      setTotal(u.total);
      setLastPage(Math.max(1, u.lastPage));
      setRoles(r);
      setPage(p);
    } catch (err: any) {
      if (err?.response?.status === 403) setForbidden(true);
      else toast.error(t("dashboard.usersLoadFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.username, u.fullName, u.name].some((v) =>
        String(v || "").toLowerCase().includes(q)
      )
    );
  }, [users, query]);

  const changeRole = async (u: AdminUserRow, roleId: string) => {
    if (!roleId || roleId === (u.role_id ?? "")) return;
    setBusyId(u.id);
    try {
      await patchUserRole(u.id, roleId);
      setUsers((prev) =>
        prev.map((x) => (x.id === u.id ? { ...x, role_id: roleId } : x))
      );
      toast.success(t("dashboard.usersUpdated"));
    } catch {
      toast.error(t("dashboard.usersUpdateFailed"));
    } finally {
      setBusyId("");
    }
  };

  // Xoa mem (#18c — tin 306): DELETE /users/:id -> Banned + thu hoi
  // phien + roi nhom + an bai. Chi xac nhan bang confirm cua trinh duyet.
  const removeUser = async (u: AdminUserRow) => {
    if (u.status === "Banned") return;
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        `Xóa mềm @${u.username}? Tài khoản bị khóa (Banned), rời khỏi các nhóm và bài viết bị ẩn. Không xóa cứng dữ liệu.`
      )
    ) {
      return;
    }
    setBusyId(u.id);
    try {
      await deleteUser(u.id);
      setUsers((prev) =>
        prev.map((x) => (x.id === u.id ? { ...x, status: "Banned" } : x))
      );
      toast.success(t("dashboard.usersUpdated"));
    } catch {
      toast.error(t("dashboard.usersUpdateFailed"));
    } finally {
      setBusyId("");
    }
  };

  const changeStatus = async (u: AdminUserRow, status: string) => {
    if (!status || status === (u.status ?? "")) return;
    setBusyId(u.id);
    try {
      await patchUserStatus(u.id, status as (typeof STATUSES)[number]);
      setUsers((prev) =>
        prev.map((x) => (x.id === u.id ? { ...x, status } : x))
      );
      toast.success(t("dashboard.usersUpdated"));
    } catch {
      toast.error(t("dashboard.usersUpdateFailed"));
    } finally {
      setBusyId("");
    }
  };

  return (
    <main className="relative h-screen overflow-hidden bg-paper">
      <Stack gap={4} className="h-screen overflow-auto px-4 pb-24 md:px-6">
        <Navigation />
        <Card>
          <Stack gap={3}>
            <HStack gap={2} vAlign="center" hAlign="between">
              <Heading level={2}>{t("dashboard.usersTitle")}</Heading>
              <Text size="sm" color="secondary">
                {t("dashboard.usersTotal", { count: total })}
              </Text>
            </HStack>
            <TextInput
              value={query}
              label={t("dashboard.usersSearch")}
              onChange={(e: any) => setQuery(e.target.value)}
              placeholder={t("dashboard.usersSearch")}
            />
            {forbidden ? (
              <Text size="sm" color="secondary">
                {t("dashboard.usersNoPermission")}
              </Text>
            ) : loading ? (
              <Text size="sm" color="secondary">
                {t("dashboard.usersLoading")}
              </Text>
            ) : filtered.length === 0 ? (
              <Text size="sm" color="secondary">
                {t("dashboard.usersEmpty")}
              </Text>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-line">
                      <th className="py-2 pr-2">{t("dashboard.usersUser")}</th>
                      <th className="py-2 pr-2">{t("dashboard.usersStatus")}</th>
                      <th className="py-2 pr-2">{t("dashboard.usersRole")}</th>
                      <th className="py-2 pr-2">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u) => (
                      <tr key={u.id} className="border-b border-line">
                        <td className="py-2 pr-2">
                          <div className="font-medium">
                            {u.fullName || u.name || u.username}
                            {u.isBot ? " [BOT]" : ""}
                          </div>
                          <div className="text-xs text-muted">@{u.username}</div>
                        </td>
                        <td className="py-2 pr-2">
                          <select
                            value={u.status ?? ""}
                            disabled={busyId === u.id}
                            onChange={(e) => void changeStatus(u, e.target.value)}
                            className="rounded border border-line bg-surface px-2 py-1">
                            {(u.status ?? "" ) && !STATUSES.includes(u.status as any) ? (
                              <option value={u.status ?? ""}>{u.status}</option>
                            ) : null}
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 pr-2">
                          <select
                            value={u.role_id ?? ""}
                            disabled={busyId === u.id || roles.length === 0}
                            onChange={(e) => void changeRole(u, e.target.value)}
                            className="rounded border border-line bg-surface px-2 py-1">
                            <option value="">—</option>
                            {roles.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 pr-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            label="Xóa mềm"
                            isDisabled={
                              busyId === u.id || u.status === "Banned"
                            }
                            onClick={() => void removeUser(u)}>
                            Xóa
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <HStack gap={2} vAlign="center">
              <Button
                size="sm"
                variant="secondary"
                label="Trang trước"
                isDisabled={page <= 1 || loading}
                onClick={() => void load(page - 1)}>
                ←
              </Button>
              <Text size="sm">
                {page} / {lastPage}
              </Text>
              <Button
                size="sm"
                variant="secondary"
                label="Trang sau"
                isDisabled={page >= lastPage || loading}
                onClick={() => void load(page + 1)}>
                →
              </Button>
            </HStack>
          </Stack>
        </Card>
      </Stack>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const user = await getAuthenticatedUser(context);
    if (user) {
      return {
        props: {
          userData: user,
        },
      };
    }
  } catch (error) {}
  return {
    redirect: {
      destination: "/login",
      permanent: false,
    },
  };
};
