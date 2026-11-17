import { FiPhone, FiPhoneOff, FiVideo } from "react-icons/fi";
import { useCallStore } from "../../store/call";
import { useI18n } from "../../i18n/I18nProvider";
import { Dialog } from "@astryxdesign/core/Dialog";
import { Stack } from "@astryxdesign/core/Stack";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { IconButton } from "@astryxdesign/core/IconButton";

/** Chuông cuộc gọi đến — chấp nhận / từ chối (tự từ chối sau 30s). */
export default function IncomingCallModal() {
  const { t } = useI18n();
  const currentCall = useCallStore((s) => s.currentCall);
  const acceptCall = useCallStore((s) => s.acceptCall);
  const declineCall = useCallStore((s) => s.declineCall);

  if (!currentCall) return null;
  const isVideo = currentCall.callType === "video";

  return (
    <Dialog
      isOpen
      onOpenChange={() => {}}
      purpose="required"
      width={384}
      aria-label={isVideo ? t("messenger.call.incomingVideo") : t("messenger.call.incomingVoice")}>
      <Stack gap={3} hAlign="center" className="text-center">
        <Stack
          hAlign="center"
          vAlign="center"
          className="mb-3 w-20 h-20 rounded-full bg-accent text-accent-ink animate-pulse">
          {isVideo ? (
            <FiVideo className="h-8 w-8" />
          ) : (
            <FiPhone className="h-8 w-8" />
          )}
        </Stack>
        <Text weight="semibold" className="text-lg">
          {currentCall.callerName || t("messenger.call.someone")}
        </Text>
        <Text size="sm" color="secondary">
          {isVideo ? t("messenger.call.incomingVideo") : t("messenger.call.incomingVoice")}
          {currentCall.isGroup ? t("messenger.call.groupChat") : ""}
        </Text>
        <Text size="sm" color="secondary">
          {currentCall.isGroup && currentCall.participants.length > 0
            ? t("messenger.call.peopleInCall", { count: currentCall.participants.length })
            : t("messenger.call.ringing")}
        </Text>
        <HStack gap={4} hAlign="center" vAlign="center" className="mt-6">
          <IconButton
            variant="destructive"
            label={t("messenger.call.decline")}
            icon={<FiPhoneOff className="h-5 w-5" />}
            onClick={declineCall}
          />
          <IconButton
            variant="primary"
            label={t("messenger.call.answer")}
            icon={<FiPhone className="h-5 w-5" />}
            onClick={acceptCall}
          />
        </HStack>
      </Stack>
    </Dialog>
  );
}
