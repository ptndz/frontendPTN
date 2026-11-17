import Navigation from "../../components/Share/Navigation";
import Link from "next/link";
import { FaUserCircle, FaUserFriends } from "react-icons/fa";
import { BsFileEarmarkPost } from "react-icons/bs";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { GetServerSideProps } from "next";
import { User } from "../../gql/graphql";
import { useStoreUser } from "../../store/user";

import { getAuthenticatedUser } from "../../lib/pages-router-auth";
import { toast } from "react-toastify";
import { useI18n } from "../../i18n/I18nProvider";
import {
  fetchReports,
  fetchVerificationRequests,
  hideReportedPost,
  reviewVerification,
  suspendUser,
  updateReportStatus,
  warnReportedUser,
  type ReportItem,
  type VerificationItem,
} from "../../lib/p3";
import { Stack } from "@astryxdesign/core/Stack";
import { HStack } from "@astryxdesign/core/HStack";
import { Grid } from "@astryxdesign/core/Grid";
import { Card } from "@astryxdesign/core/Card";
import { Section } from "@astryxdesign/core/Section";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Button } from "@astryxdesign/core/Button";
import { List, ListItem } from "@astryxdesign/core/List";
import { Selector } from "@astryxdesign/core/Selector";
import { ProgressBar } from "@astryxdesign/core/ProgressBar";

interface IProps {
  userData: User;
}

/** Mũi tên tăng/giảm cho các thẻ số liệu mẫu (thay cho SVG mũi tên cũ). */
function Delta({
  pct,
  up,
  size,
}: {
  pct: number;
  up: boolean;
  size?: "sm" | "base";
}) {
  return (
    <Text
      size={size}
      weight="semibold"
      className={up ? "text-success" : "text-danger"}>
      {up ? "▲" : "▼"} {pct}%
    </Text>
  );
}

interface DemoDelta {
  pct: number;
  up: boolean;
}
interface DemoRow {
  label: string;
  value: number;
  delta: DemoDelta;
}
interface DemoCard {
  title: string;
  value: number;
  delta: DemoDelta;
  rows: DemoRow[];
}

/**
 * Các thẻ số liệu mẫu (nội dung tĩnh, giữ nguyên chữ/số cũ kể cả lỗi
 * chính tả "Project Reffered" / "Amercia").
 */
const DEMO_CARDS: DemoCard[] = [
  {
    title: "Project Reffered",
    value: 12,
    delta: { pct: 22, up: true },
    rows: [
      { label: "Unique URL", value: 34, delta: { pct: 22, up: true } },
      { label: "Embedded form", value: 13, delta: { pct: 12, up: true } },
      { label: "New visitor", value: 45, delta: { pct: 41, up: true } },
    ],
  },
  {
    title: "Project Paid",
    value: 23,
    delta: { pct: 12, up: true },
    rows: [
      { label: "User paid", value: 21, delta: { pct: 20, up: true } },
      { label: "Income", value: 10, delta: { pct: 2, up: true } },
      { label: "Royal tees", value: 434, delta: { pct: 12, up: false } },
    ],
  },
  {
    title: "New features",
    value: 12,
    delta: { pct: 2, up: false },
    rows: [
      { label: "Down", value: 34, delta: { pct: 22, up: false } },
      { label: "Up", value: 13, delta: { pct: 12, up: true } },
      { label: "No developed", value: 45, delta: { pct: 41, up: false } },
    ],
  },
  {
    title: "Sign in",
    value: 16,
    delta: { pct: 14, up: false },
    rows: [
      { label: "Amercia", value: 43, delta: { pct: 12, up: false } },
      { label: "Europe", value: 133, delta: { pct: 19, up: true } },
      { label: "Asia", value: 23, delta: { pct: 4, up: false } },
    ],
  },
  {
    title: "Sales",
    value: 9,
    delta: { pct: 34, up: true },
    rows: [
      { label: "Templates", value: 345, delta: { pct: 12, up: false } },
      { label: "Components", value: 139, delta: { pct: 10, up: true } },
      { label: "Icons", value: 421, delta: { pct: 4, up: false } },
    ],
  },
  {
    title: "Maintenance",
    value: 15,
    delta: { pct: 34, up: true },
    rows: [
      { label: "Cloud", value: 123, delta: { pct: 22, up: false } },
      { label: "Infra", value: 134, delta: { pct: 9, up: true } },
      { label: "Office", value: 23, delta: { pct: 41, up: true } },
    ],
  },
];

const PageDashboard: React.FC<IProps> = ({ userData }) => {
  const { t } = useI18n();
  const [numberUser, serNumberUser] = useState<number>(0);
  const [numberPost, serNumberPost] = useState<number>(0);
  const [numberFriend, serNumberFriend] = useState<number>(0);
  const { setUser } = useStoreUser();
  // P3.1/P3.4 — queue kiểm duyệt + đơn xin xác minh (chỉ admin/mod thấy dữ liệu).
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [verifications, setVerifications] = useState<VerificationItem[]>([]);
  const [reportFilter, setReportFilter] = useState("open");

  const loadModeration = useCallback(async (status = reportFilter) => {
    try {
      setReports(await fetchReports(status));
    } catch {
      // Không phải admin/mod -> GET /reports trả 403, queue để trống.
      setReports([]);
    }
    try {
      setVerifications(await fetchVerificationRequests("pending"));
    } catch {
      setVerifications([]);
    }
  }, [reportFilter]);

  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, [setUser, userData]);

  useEffect(() => {
    const fetchData = async () => {
      const resUser = await axios.get("/dashboard/user/all");
      serNumberUser(resUser.data[1] as number);
      const resPost = await axios.get("/dashboard/post/all");
      serNumberPost(resPost.data[1] as number);
      const resFriend = await axios.get("/dashboard/friend/all");
      serNumberFriend(resFriend.data[1] as number);
    };
    fetchData();
    loadModeration();
  }, [loadModeration]);

  return (
    <main className="relative h-screen overflow-hidden bg-paper">
      <Stack gap={4} className="h-screen overflow-auto px-4 pb-24 md:px-6">
        <Navigation />

        {/* #18c — lien ket sang trang quan ly user. */}
        <HStack gap={2} vAlign="center">
          <Link href="/dashboard/users" className="text-sm text-accent underline">
            {t("dashboard.usersTitle")}
          </Link>
        </HStack>

        {/* Số liệu thật từ API dashboard. */}
        <Grid columns={{ minWidth: 260, max: 3 }} gap={4}>
          <Card>
            <Stack gap={3}>
              <HStack gap={2} vAlign="center">
                <FaUserCircle className="h-10 w-10" />
                <Text weight="semibold">{t("dashboard.registeredUser")}</Text>
              </HStack>
              <HStack gap={2} vAlign="end">
                <Text size="xl" weight="bold" hasTabularNumbers>
                  {numberUser}
                </Text>
                <Text type="supporting">/1000</Text>
              </HStack>
              <ProgressBar
                label={t("dashboard.registeredUser")}
                isLabelHidden
                value={numberUser}
                max={1000}
                variant="success"
              />
            </Stack>
          </Card>
          <Card>
            <HStack gap={3} hAlign="between" vAlign="start">
              <Stack gap={0}>
                <Text size="xl" weight="bold" hasTabularNumbers>
                  {numberPost}
                </Text>
                <Text type="supporting">{t("dashboard.posts")}</Text>
              </Stack>
              <BsFileEarmarkPost className="h-10 w-10" />
            </HStack>
          </Card>
          <Card>
            <HStack gap={3} hAlign="between" vAlign="start">
              <Stack gap={0}>
                <Text size="xl" weight="bold" hasTabularNumbers>
                  {numberFriend}
                </Text>
                <Text type="supporting">{t("dashboard.numberOfFriends")}</Text>
              </Stack>
              <FaUserFriends className="h-10 w-10" />
            </HStack>
          </Card>
        </Grid>

        {/* Thẻ số liệu mẫu (tĩnh). */}
        <Grid columns={{ minWidth: 280, max: 3 }} gap={4}>
          {DEMO_CARDS.map((card) => (
            <Card key={card.title}>
              <Stack gap={3}>
                <Text weight="semibold">{card.title}</Text>
                <HStack gap={2} vAlign="end">
                  <Text size="4xl" weight="bold" hasTabularNumbers>
                    {card.value}
                  </Text>
                  <Delta pct={card.delta.pct} up={card.delta.up} />
                </HStack>
                <List hasDividers>
                  {card.rows.map((row) => (
                    <ListItem
                      key={row.label}
                      label={row.label}
                      endContent={
                        <HStack gap={2} vAlign="center">
                          <Text size="sm" hasTabularNumbers>
                            {row.value}
                          </Text>
                          <Delta
                            pct={row.delta.pct}
                            up={row.delta.up}
                            size="sm"
                          />
                        </HStack>
                      }
                    />
                  ))}
                </List>
              </Stack>
            </Card>
          ))}
        </Grid>

        {/* ------------------- P3.1 — Queue kiểm duyệt ------------------- */}
        <Section>
          <Stack gap={3}>
            <HStack gap={3} hAlign="between" vAlign="center" wrap="wrap">
              <Heading level={2}>{t("dashboard.moderationTitle")}</Heading>
              <Selector
                label={t("dashboard.reportStatus")}
                isLabelHidden
                value={reportFilter}
                onChange={(value) => {
                  setReportFilter(value);
                  loadModeration(value);
                }}
                options={[
                  { value: "open", label: t("dashboard.statusOpen") },
                  { value: "resolved", label: t("dashboard.statusResolved") },
                  { value: "dismissed", label: t("dashboard.statusDismissed") },
                ]}
              />
            </HStack>
            {reports.length === 0 ? (
              <Text type="supporting">
                {t("dashboard.noReports")}
              </Text>
            ) : (
              <List hasDividers>
                {reports.map((r) => (
                  <ListItem
                    key={r.id}
                    label={
                      <Text maxLines={2}>
                        #{r.id} [{r.targetType}] {r.targetId} — {r.reason}
                      </Text>
                    }
                    description={`${t("dashboard.reporter", {
                      name:
                        r.reporter?.fullName ||
                        r.reporter?.username ||
                        (r.reporterId ?? ""),
                    })} · ${r.createdAt?.slice(0, 10) ?? ""} · ${r.status}`}
                    endContent={
                      r.status === "open" ? (
                        <HStack gap={2} wrap="wrap">
                          {r.targetType === "post" && (
                            <Button
                              variant="secondary"
                              size="sm"
                              label={t("dashboard.hidePost")}
                              onClick={async () => {
                                try {
                                  await hideReportedPost(r.id);
                                  toast.success(t("dashboard.postHidden"));
                                  loadModeration();
                                } catch {
                                  toast.error(t("dashboard.hideFailed"));
                                }
                              }}
                            />
                          )}
                          <Button
                            variant="secondary"
                            size="sm"
                            label={t("dashboard.warnUser")}
                            onClick={async () => {
                              try {
                                await warnReportedUser(r.id);
                                toast.success(t("dashboard.warnSent"));
                                loadModeration();
                              } catch {
                                toast.error(t("dashboard.warnFailed"));
                              }
                            }}
                          />
                          {r.targetType === "user" && (
                            <Button
                              variant="secondary"
                              size="sm"
                              label={t("dashboard.suspendUser")}
                              onClick={async () => {
                                try {
                                  await suspendUser(r.targetId);
                                  toast.success(t("dashboard.suspended"));
                                  loadModeration();
                                } catch {
                                  toast.error(t("dashboard.suspendFailed"));
                                }
                              }}
                            />
                          )}
                          <Button
                            variant="primary"
                            size="sm"
                            label={t("dashboard.markResolved")}
                            onClick={async () => {
                              try {
                                await updateReportStatus(r.id, "resolved");
                                loadModeration();
                              } catch {
                                toast.error(t("dashboard.updateFailed"));
                              }
                            }}
                          />
                          <Button
                            variant="secondary"
                            size="sm"
                            label={t("dashboard.dismiss")}
                            onClick={async () => {
                              try {
                                await updateReportStatus(r.id, "dismissed");
                                loadModeration();
                              } catch {
                                toast.error(t("dashboard.updateFailed"));
                              }
                            }}
                          />
                        </HStack>
                      ) : undefined
                    }
                  />
                ))}
              </List>
            )}
          </Stack>
        </Section>

        {/* ---------------- P3.4 — Đơn xin xác minh ---------------- */}
        <Section>
          <Stack gap={3}>
            <Heading level={2}>{t("dashboard.verificationsTitle")}</Heading>
            {verifications.length === 0 ? (
              <Text type="supporting">{t("dashboard.noVerifications")}</Text>
            ) : (
              <List hasDividers>
                {verifications.map((v) => (
                  <ListItem
                    key={v.id}
                    label={
                      <Text maxLines={2}>
                        {v.user?.fullName || v.user?.username || v.userId} —{" "}
                        {v.reason}
                      </Text>
                    }
                    description={`#${v.id} · ${v.createdAt?.slice(0, 10) ?? ""}`}
                    endContent={
                      <HStack gap={2} wrap="wrap">
                        <Button
                          variant="primary"
                          size="sm"
                          label={t("dashboard.approve")}
                          onClick={async () => {
                            try {
                              await reviewVerification(v.id, true);
                              toast.success(t("dashboard.verifyApproved"));
                              loadModeration();
                            } catch {
                              toast.error(t("dashboard.approveFailed"));
                            }
                          }}
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          label={t("dashboard.reject")}
                          onClick={async () => {
                            try {
                              await reviewVerification(v.id, false);
                              loadModeration();
                            } catch {
                              toast.error(t("dashboard.rejectFailed"));
                            }
                          }}
                        />
                      </HStack>
                    }
                  />
                ))}
              </List>
            )}
          </Stack>
        </Section>
      </Stack>
    </main>
  );
};

export default PageDashboard;

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
