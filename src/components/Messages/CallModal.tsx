import { useEffect, useRef } from "react";
import { FiMic, FiMicOff, FiPhoneOff, FiVideo, FiVideoOff } from "react-icons/fi";
import { useCallStore } from "../../store/call";
import { useI18n } from "../../i18n/I18nProvider";
import { Dialog } from "@astryxdesign/core/Dialog";
import { DialogHeader } from "@astryxdesign/core/Dialog";
import { Stack } from "@astryxdesign/core/Stack";
import { HStack } from "@astryxdesign/core/HStack";
import { Grid } from "@astryxdesign/core/Grid";
import { Text } from "@astryxdesign/core/Text";
import { IconButton } from "@astryxdesign/core/IconButton";
import { Avatar } from "@astryxdesign/core/Avatar";

function formatDuration(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function VideoTile({
  stream,
  label,
  muted,
  isLocal,
}: {
  stream: MediaStream | null;
  label: string;
  muted?: boolean;
  isLocal?: boolean;
}) {
  const { t } = useI18n();
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);
  return (
    <Stack className="relative rounded-xl bg-ink overflow-hidden aspect-video" hAlign="center" vAlign="center">
      {stream ? (
        <video
          ref={ref}
          autoPlay
          playsInline
          muted={muted}
          className={`w-full h-full object-cover ${isLocal ? "-scale-x-100" : ""}`}
        />
      ) : (
        <Text size="sm" color="secondary">
          {t("messenger.call.connecting")}
        </Text>
      )}
      <Text size="sm" className="absolute bottom-2 left-2 bg-ink/70 text-paper px-2 py-0.5 rounded-full">
        {label}
        {isLocal ? t("messenger.call.you") : ""}
      </Text>
    </Stack>
  );
}

function VoiceTile({ label, isLocal }: { label: string; isLocal?: boolean }) {
  const { t } = useI18n();
  return (
    <Stack gap={2} hAlign="center" vAlign="center" className="rounded-xl bg-paper border border-line py-8">
      <Avatar name={initials(label)} size={64} tooltip={false} />
      <Text size="sm">
        {label}
        {isLocal ? t("messenger.call.you") : ""}
      </Text>
    </Stack>
  );
}

/** Màn hình cuộc gọi đang diễn ra (cả gọi đi đang chờ + đã nối). */
export default function CallModal() {
  const { t } = useI18n();
  const callState = useCallStore((s) => s.callState);
  const currentCall = useCallStore((s) => s.currentCall);
  const localStream = useCallStore((s) => s.localStream);
  const remoteStreams = useCallStore((s) => s.remoteStreams);
  const isMuted = useCallStore((s) => s.isMuted);
  const isVideoOff = useCallStore((s) => s.isVideoOff);
  const callDuration = useCallStore((s) => s.callDuration);
  const error = useCallStore((s) => s.error);
  const endCall = useCallStore((s) => s.endCall);
  const toggleMute = useCallStore((s) => s.toggleMute);
  const toggleVideo = useCallStore((s) => s.toggleVideo);

  if (!currentCall) return null;
  const isVideo = currentCall.callType === "video";
  const remoteIds = Object.keys(remoteStreams);
  const nameOf = (userId: string): string =>
    currentCall.participants.find((p) => p.userId === userId)?.userName ||
    t("messenger.call.participants");
  const status =
    callState === "calling"
      ? t("messenger.call.calling")
      : callState === "joining"
        ? t("messenger.call.joining")
        : t("messenger.call.callingWithDuration", { duration: formatDuration(callDuration) });

  return (
    <Dialog
      isOpen
      onOpenChange={() => {}}
      purpose="required"
      width={768}>
      <DialogHeader
        title={`${currentCall.title}${currentCall.isGroup ? t("messenger.call.group") : ""}`}
        subtitle={`${isVideo ? t("messenger.call.videoCall") : t("messenger.call.voiceCall")} · ${status}`}
      />
      <Stack gap={4}>
        <HStack gap={2} vAlign="center" hAlign="end">
          <Text size="sm" color="secondary">
            {t("messenger.call.peopleCount", { count: currentCall.participants.length })}
          </Text>
        </HStack>

        {error ? (
          <Text size="sm" className="text-danger">
            {error}
          </Text>
        ) : null}

        {isVideo ? (
          <Grid columns={{ minWidth: 280, max: 2 }} gap={3}>
            <VideoTile
              stream={isVideoOff ? null : localStream}
              label={t("messenger.call.youLabel")}
              muted
              isLocal
            />
            {remoteIds.length === 0 ? (
              <VideoTile stream={null} label={t("messenger.call.waiting")} />
            ) : (
              remoteIds.map((id) => (
                <VideoTile key={id} stream={remoteStreams[id]} label={nameOf(id)} />
              ))
            )}
          </Grid>
        ) : (
          <Stack gap={3}>
            <Grid columns={{ minWidth: 280, max: 2 }} gap={3}>
              <VoiceTile label={t("messenger.call.youLabel")} isLocal />
              {currentCall.participants
                .filter((p) => remoteStreams[p.userId])
                .map((p) => (
                  <VoiceTile key={p.userId} label={p.userName} />
                ))}
              {remoteIds.length === 0 ? (
                <VoiceTile label={t("messenger.call.waiting")} />
              ) : null}
            </Grid>
            {/* Âm thanh của peer thoại: phần tử audio ẩn. */}
            {remoteIds.map((id) => (
              <RemoteAudio key={id} stream={remoteStreams[id]} />
            ))}
          </Stack>
        )}

        <HStack gap={3} hAlign="center" vAlign="center">
          <IconButton
            variant={isMuted ? "destructive" : "secondary"}
            label={isMuted ? t("messenger.call.unmute") : t("messenger.call.mute")}
            icon={isMuted ? <FiMicOff className="h-5 w-5" /> : <FiMic className="h-5 w-5" />}
            isDisabled={callState !== "connected"}
            onClick={toggleMute}
          />
          {isVideo ? (
            <IconButton
              variant={isVideoOff ? "destructive" : "secondary"}
              label={isVideoOff ? t("messenger.call.cameraOn") : t("messenger.call.cameraOff")}
              icon={isVideoOff ? <FiVideoOff className="h-5 w-5" /> : <FiVideo className="h-5 w-5" />}
              isDisabled={callState !== "connected"}
              onClick={toggleVideo}
            />
          ) : null}
          <IconButton
            variant="destructive"
            label={currentCall.isGroup ? t("messenger.call.leaveCall") : t("messenger.call.endCall")}
            icon={<FiPhoneOff className="h-5 w-5" />}
            onClick={endCall}
          />
        </HStack>
        <Text size="sm" color="secondary" className="text-center">
          {currentCall.isGroup
            ? t("messenger.call.leaveNote")
            : t("messenger.call.endNote")}
        </Text>
      </Stack>
    </Dialog>
  );
}

function RemoteAudio({ stream }: { stream: MediaStream }) {
  const ref = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);
  return <audio ref={ref} autoPlay playsInline className="hidden" />;
}
