import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import socket from "../../plugins/socket";
import { useCallStore } from "../../store/call";
import CallModal from "./CallModal";
import IncomingCallModal from "./IncomingCallModal";
import CallErrorBoundary from "./CallErrorBoundary";
import { useI18n } from "../../i18n/I18nProvider";

/**
 * P2.4 — Gắn 1 lần ở _app: nghe mọi event cuộc gọi từ server (kể cả khi
 * user đang ở feed, không mở trang messenger), rồi render chuông đến /
 * màn hình cuộc gọi. Toast chỉ báo các kết quả cần user biết (bị từ
 * chối, bận, hết chuông, lỗi); các event nối máy thành công thì modal
 * tự hiện, không toast thêm.
 */
export default function CallProvider() {
  const { t } = useI18n();
  // t() trong callback socket (deps []) -> đọc qua ref để luôn dùng locale mới nhất.
  const tRef = useRef(t);
  tRef.current = t;
  const callState = useCallStore((s) => s.callState);
  const currentCall = useCallStore((s) => s.currentCall);

  useEffect(() => {
    const s = useCallStore.getState();
    const onDeclined = () => toast.info(tRef.current("messenger.callToast.declined"));
    const onEndedTimeout = (data: any) => {
      // toastId chung với ringTimer client-side trong store/call.ts:
      // server cũng gửi callEnded reason=timeout nên không có toastId
      // sẽ hiện 2 toast "Không có người trả lời." giống hệt nhau.
      if (data?.reason === "timeout") toast.info(tRef.current("messenger.callToast.noAnswer"), { toastId: "call-no-answer" });
    };
    const onBusy = () => toast.info(tRef.current("messenger.callToast.busy"));
    const onError = (data: any) => {
      if (data?.message) toast.error(data.message);
    };
    socket.on("incomingCall", s.handleIncomingCall);
    socket.on("callInitiated", s.handleCallInitiated);
    socket.on("callAccepted", s.handleCallAccepted);
    socket.on("callDeclined", s.handleCallDeclined);
    socket.on("callEnded", s.handleCallEnded);
    socket.on("userBusy", s.handleUserBusy);
    socket.on("participantJoinedCall", s.handleParticipantJoinedCall);
    socket.on("participantLeftCall", s.handleParticipantLeftCall);
    socket.on("participantDeclinedCall", s.handleParticipantDeclinedCall);
    socket.on("callSignal", s.handleCallSignal);
    socket.on("activeCall", s.handleActiveCall);
    socket.on("callError", s.handleCallError);
    socket.on("callDeclined", onDeclined);
    socket.on("callEnded", onEndedTimeout);
    socket.on("userBusy", onBusy);
    socket.on("callError", onError);
    return () => {
      socket.off("incomingCall", s.handleIncomingCall);
      socket.off("callInitiated", s.handleCallInitiated);
      socket.off("callAccepted", s.handleCallAccepted);
      socket.off("callDeclined", s.handleCallDeclined);
      socket.off("callEnded", s.handleCallEnded);
      socket.off("userBusy", s.handleUserBusy);
      socket.off("participantJoinedCall", s.handleParticipantJoinedCall);
      socket.off("participantLeftCall", s.handleParticipantLeftCall);
      socket.off("participantDeclinedCall", s.handleParticipantDeclinedCall);
      socket.off("callSignal", s.handleCallSignal);
      socket.off("activeCall", s.handleActiveCall);
      socket.off("callError", s.handleCallError);
      socket.off("callDeclined", onDeclined);
      socket.off("callEnded", onEndedTimeout);
      socket.off("userBusy", onBusy);
      socket.off("callError", onError);
    };
  }, []);

  return (
    <CallErrorBoundary>
      {callState === "ringing" && currentCall ? <IncomingCallModal /> : null}
      {callState !== "idle" && callState !== "ringing" && currentCall ? (
        <CallModal />
      ) : null}
    </CallErrorBoundary>
  );
}
