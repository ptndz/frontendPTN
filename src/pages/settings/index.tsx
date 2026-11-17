import Navigation from "../../components/Share/Navigation";
import { useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import { User } from "../../gql/graphql";
import { useStoreUser } from "../../store/user";
import { getAuthenticatedUser } from "../../lib/pages-router-auth";
import { toast } from "react-toastify";
import {
  changePassword,
  disableTwoFactor,
  enableTwoFactor,
  fetchDevices,
  fetchMyBlocks,
  fetchSettings,
  revokeAllDevices,
  revokeDevice,
  setupTwoFactor,
  unblockUser,
  updateSettings,
  type DeviceItem,
  type PrivacySettings,
} from "../../lib/p3";
import { generateNextSeo } from "next-seo/pages";
import { useI18n } from "../../i18n/I18nProvider";
import LanguageSwitcher from "../../components/Share/LanguageSwitcher";
import { Stack } from "@astryxdesign/core/Stack";
import { Section } from "@astryxdesign/core/Section";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { FormLayout } from "@astryxdesign/core/FormLayout";
import { Selector } from "@astryxdesign/core/Selector";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Button } from "@astryxdesign/core/Button";
import { List, ListItem } from "@astryxdesign/core/List";

interface IProps {
  userData: User;
}

const PageSettings: React.FC<IProps> = ({ userData }) => {
  const { setUser } = useStoreUser();
  const { t } = useI18n();
  const [settings, setSettings] = useState<PrivacySettings | null>(null);
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [blocks, setBlocks] = useState<
    { id: number; blockedId: string; blocked: any }[]
  >([]);

  // Đổi mật khẩu.
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");

  // 2FA.
  const [twoFactorSecret, setTwoFactorSecret] = useState("");
  const [twoFactorUrl, setTwoFactorUrl] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [disableCode, setDisableCode] = useState("");

  useEffect(() => {
    if (userData) setUser(userData);
  }, [setUser, userData]);

  const loadAll = async () => {
    try {
      const s = await fetchSettings();
      setSettings(s);
      setDevices(await fetchDevices());
      setBlocks(await fetchMyBlocks());
    } catch {
      // Trang vẫn hiện, từng mục báo lỗi riêng khi thao tác.
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const savePrivacy = async () => {
    if (!settings) return;
    try {
      const saved = await updateSettings({
        friendRequestPolicy: settings.friendRequestPolicy,
        messagePolicy: settings.messagePolicy,
        defaultAudience: settings.defaultAudience,
      });
      if (saved) setSettings(saved);
      toast.success(t("settings.savedPrivacy"));
    } catch {
      toast.error(t("settings.saveFailed"));
    }
  };

  return (
    <main className="relative h-screen overflow-hidden bg-paper">
      <Stack gap={4} className="h-screen overflow-auto px-4 pb-24 md:px-6">
        <Navigation />
        {generateNextSeo({ title: t("settings.title"), description: t("settings.seoDescription") })}

        <Heading level={1}>{t("settings.title")}</Heading>

        {/* P5b — chọn ngôn ngữ giao diện (lưu localStorage + cookie). */}
        <Section>
          <Stack gap={2}>
            <Heading level={2}>{t("settings.language")}</Heading>
            <Text type="supporting">{t("settings.languageHint")}</Text>
            <LanguageSwitcher />
          </Stack>
        </Section>

        {/* ------------------------- Riêng tư (P3.2) ------------------------- */}
        <Section>
          <Stack gap={3}>
            <Heading level={2}>{t("settings.privacy")}</Heading>
            {settings ? (
              <>
                <FormLayout>
                  <Selector
                    label={t("settings.whoFriendRequest")}
                    value={settings.friendRequestPolicy}
                    onChange={(value) =>
                      setSettings({
                        ...settings,
                        friendRequestPolicy: value as PrivacySettings["friendRequestPolicy"],
                      })
                    }
                    options={[
                      { value: "everyone", label: t("settings.everyone") },
                      { value: "friends-of-friends", label: t("settings.friendsOfFriends") },
                      { value: "nobody", label: t("settings.nobody") },
                    ]}
                    width="100%"
                  />
                  <Selector
                    label={t("settings.whoMessage")}
                    value={settings.messagePolicy}
                    onChange={(value) =>
                      setSettings({
                        ...settings,
                        messagePolicy: value as PrivacySettings["messagePolicy"],
                      })
                    }
                    options={[
                      { value: "everyone", label: t("settings.everyone") },
                      { value: "friends", label: t("settings.friendsOnly") },
                    ]}
                    width="100%"
                  />
                  <Selector
                    label={t("settings.defaultAudience")}
                    value={settings.defaultAudience}
                    onChange={(value) =>
                      setSettings({
                        ...settings,
                        defaultAudience: value as PrivacySettings["defaultAudience"],
                      })
                    }
                    options={[
                      { value: "public", label: t("feed.audience.public") },
                      { value: "friends", label: t("feed.audience.friends") },
                      { value: "only-me", label: t("feed.audience.onlyMe") },
                    ]}
                    width="100%"
                  />
                </FormLayout>
                <Button
                  variant="primary"
                  size="sm"
                  label={t("settings.savePrivacy")}
                  onClick={savePrivacy}
                />
              </>
            ) : (
              <Text type="supporting">{t("settings.loading")}</Text>
            )}
          </Stack>
        </Section>

        {/* ---------------------- Đổi mật khẩu (P3.3) ---------------------- */}
        <Section>
          <Stack gap={3}>
            <Heading level={2}>{t("settings.changePassword")}</Heading>
            <FormLayout>
              <TextInput
                label={t("settings.currentPassword")}
                isLabelHidden
                type="password"
                placeholder={t("settings.currentPassword")}
                value={oldPassword}
                onChange={(value) => setOldPassword(value)}
                width="100%"
              />
              <TextInput
                label={t("settings.newPassword")}
                isLabelHidden
                type="password"
                placeholder={t("settings.newPassword")}
                value={newPassword}
                onChange={(value) => setNewPassword(value)}
                width="100%"
              />
              <TextInput
                label={t("settings.retypeNewPassword")}
                isLabelHidden
                type="password"
                placeholder={t("settings.retypeNewPassword")}
                value={newPassword2}
                onChange={(value) => setNewPassword2(value)}
                width="100%"
              />
            </FormLayout>
            <Button
              variant="primary"
              size="sm"
              label={t("settings.changePassword")}
              onClick={async () => {
                if (newPassword !== newPassword2) {
                  toast.error(t("settings.passwordMismatch"));
                  return;
                }
                try {
                  await changePassword(oldPassword, newPassword);
                  setOldPassword("");
                  setNewPassword("");
                  setNewPassword2("");
                  toast.success(t("settings.passwordChanged"));
                } catch {
                  toast.error(t("settings.passwordChangeFailed"));
                }
              }}
            />
          </Stack>
        </Section>

        {/* --------------------------- 2FA (P3.3) --------------------------- */}
        <Section>
          <Stack gap={3}>
            <Heading level={2}>{t("settings.twoFactor")}</Heading>
            <Text type="supporting">
              {t("settings.status")}{" "}
              {settings?.twoFactorEnabled ? t("settings.enabled") : t("settings.disabled")}
            </Text>
            {!settings?.twoFactorEnabled ? (
              <Stack gap={3}>
                {!twoFactorSecret ? (
                  <Button
                    variant="primary"
                    size="sm"
                    label={t("settings.start2fa")}
                    onClick={async () => {
                      try {
                        const res = await setupTwoFactor();
                        setTwoFactorSecret(res.secret);
                        setTwoFactorUrl(res.otpauthUrl);
                      } catch {
                        toast.error(t("settings.create2faFailed"));
                      }
                    }}
                  />
                ) : (
                  <Stack gap={2}>
                    <Text>{t("settings.scanHint")}</Text>
                    <Text type="code" wordBreak="break-all">
                      {twoFactorSecret}
                    </Text>
                    <Text type="supporting" wordBreak="break-all">
                      {twoFactorUrl}
                    </Text>
                    <TextInput
                      label={t("settings.codePlaceholder")}
                      isLabelHidden
                      type="text"
                      placeholder={t("settings.codePlaceholder")}
                      value={twoFactorCode}
                      onChange={(value) => setTwoFactorCode(value)}
                      width="100%"
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      label={t("settings.confirm2fa")}
                      onClick={async () => {
                        try {
                          const codes = await enableTwoFactor(twoFactorCode);
                          setBackupCodes(codes);
                          setTwoFactorSecret("");
                          setTwoFactorCode("");
                          await loadAll();
                          toast.success(t("settings.enabled2fa"));
                        } catch {
                          toast.error(t("settings.codeWrong"));
                        }
                      }}
                    />
                  </Stack>
                )}
                {backupCodes.length > 0 && (
                  <Section variant="muted">
                    <Stack gap={1}>
                      <Text weight="semibold">{t("settings.backupTitle")}</Text>
                      {backupCodes.map((c) => (
                        <Text key={c} type="code">
                          {c}
                        </Text>
                      ))}
                    </Stack>
                  </Section>
                )}
              </Stack>
            ) : (
              <Stack gap={3}>
                <Text type="supporting">{t("settings.disableHint")}</Text>
                <TextInput
                  label={t("settings.disableCodePlaceholder")}
                  isLabelHidden
                  type="text"
                  placeholder={t("settings.disableCodePlaceholder")}
                  value={disableCode}
                  onChange={(value) => setDisableCode(value)}
                  width="100%"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  label={t("settings.disable2fa")}
                  onClick={async () => {
                    try {
                      await disableTwoFactor(disableCode);
                      setDisableCode("");
                      await loadAll();
                      toast.success(t("settings.disabled2fa"));
                    } catch {
                      toast.error(t("settings.codeWrongDisable"));
                    }
                  }}
                />
              </Stack>
            )}
          </Stack>
        </Section>

        {/* ------------------------- Thiết bị (P3.3) ------------------------- */}
        <Section>
          <Stack gap={3}>
            <Heading level={2}>{t("settings.devices")}</Heading>
            <Text type="supporting">{t("settings.devicesHint")}</Text>
            {devices.length === 0 ? (
              <Text type="supporting">{t("settings.noDevices")}</Text>
            ) : (
              <List hasDividers>
                {devices.map((d) => (
                  <ListItem
                    key={d.id}
                    label={d.agent || t("settings.deviceFallback")}
                    description={`${d.ip} — ${d.createdAt?.slice(0, 10) ?? ""}`}
                    endContent={
                      <Button
                        variant="secondary"
                        size="sm"
                        label={t("settings.revoke")}
                        onClick={async () => {
                          try {
                            await revokeDevice(d.id);
                            setDevices(devices.filter((x) => x.id !== d.id));
                            toast.success(t("settings.revoked"));
                          } catch {
                            toast.error(t("settings.revokeFailed"));
                          }
                        }}
                      />
                    }
                  />
                ))}
              </List>
            )}
            {devices.length > 0 && (
              <Button
                variant="secondary"
                size="sm"
                label={t("settings.revokeAll")}
                onClick={async () => {
                  try {
                    await revokeAllDevices();
                    setDevices([]);
                    toast.success(t("settings.revokedAll"));
                  } catch {
                    toast.error(t("settings.revokeFailed"));
                  }
                }}
              />
            )}
          </Stack>
        </Section>

        {/* -------------------- Đã chặn (P3.2) -------------------- */}
        <Section>
          <Stack gap={3}>
            <Heading level={2}>{t("settings.blocked")}</Heading>
            {blocks.length === 0 ? (
              <Text type="supporting">{t("settings.noBlocks")}</Text>
            ) : (
              <List hasDividers>
                {blocks.map((b) => (
                  <ListItem
                    key={b.id}
                    label={
                      b.blocked?.fullName || b.blocked?.username || b.blockedId
                    }
                    endContent={
                      <Button
                        variant="secondary"
                        size="sm"
                        label={t("settings.unblock")}
                        onClick={async () => {
                          try {
                            await unblockUser(b.blockedId);
                            setBlocks(blocks.filter((x) => x.id !== b.id));
                            toast.success(t("settings.unblocked"));
                          } catch {
                            toast.error(t("settings.unblockFailed"));
                          }
                        }}
                      />
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

export default PageSettings;

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const user = await getAuthenticatedUser(context);
    if (user) {
      return { props: { userData: user } };
    }
  } catch {}
  return { redirect: { destination: "/login", permanent: false } };
};
