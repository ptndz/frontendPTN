import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@astryxdesign/core/Button";
import { Center } from "@astryxdesign/core/Center";
import { Heading } from "@astryxdesign/core/Heading";
import { Stack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import {
  acceptInviteToken,
  validateInviteToken,
  type GroupInviteRow,
} from "../../lib/groupInvites";

/**
 * Trang mo link moi vao nhom chat (#18c — tin 306).
 * GET /messenger/invites/:token la public nen xem duoc ten nhom truoc
 * khi dang nhap; nut tham gia doi auth (chua dang nhap -> sang /login).
 */
export default function InvitePage() {
  const router = useRouter();
  const token = String(router.query.token ?? "");
  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<GroupInviteRow | null>(null);
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    void validateInviteToken(token)
      .then((res) => {
        if (cancelled) return;
        if (res.valid && res.invite) setInvite(res.invite);
        else setError(res.message ?? "Link mời không hợp lệ");
      })
      .catch(() => {
        if (!cancelled) setError("Không kiểm tra được link mời");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const join = async () => {
    if (!token) return;
    setJoining(true);
    setError("");
    try {
      await acceptInviteToken(token);
      setJoined(true);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        void router.push(`/login?next=/invite/${token}`);
        return;
      }
      setError(
        err?.response?.data?.message ?? "Không tham gia được nhóm, thử lại sau"
      );
    } finally {
      setJoining(false);
    }
  };

  return (
    <Center axis="both" minHeight="80vh">
      <Stack gap={4} hAlign="center" className="px-4 text-center">
        <Heading level={1} type="display-2" justify="center">
          Lời mời vào nhóm
        </Heading>
        {loading ? (
          <Text justify="center">Đang kiểm tra link mời…</Text>
        ) : joined && invite ? (
          <>
            <Text justify="center">
              Bạn đã tham gia nhóm “{invite.conversationName ?? "nhóm chat"}”.
            </Text>
            <Button label="Mở nhóm chat" href="/messenger" variant="primary" />
          </>
        ) : invite ? (
          <>
            <Text justify="center">
              Bạn được mời vào nhóm “{invite.conversationName ?? "nhóm chat"}”
              {invite.createdBy?.username
                ? ` bởi @${invite.createdBy.username}`
                : ""}
              {invite.usesLeft !== null && invite.usesLeft !== undefined
                ? ` (còn ${invite.usesLeft} lượt)`
                : ""}
              .
            </Text>
            <Button
              label="Tham gia nhóm"
              variant="primary"
              isDisabled={joining}
              onClick={() => void join()}
            />
            <Button label="Đăng nhập" href="/login" variant="secondary" />
          </>
        ) : (
          <>
            <Text justify="center">{error || "Link mời không hợp lệ"}</Text>
            <Button label="Về trang chủ" href="/" variant="primary" />
          </>
        )}
        {!loading && !joined && error && invite ? (
          <Text justify="center" className="text-danger">
            {error}
          </Text>
        ) : null}
      </Stack>
    </Center>
  );
}
