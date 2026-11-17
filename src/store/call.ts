/**
 * P2.4 — Store cuộc gọi thoại/video (mesh WebRTC qua Socket.IO).
 *
 * Luồng (giống ngữ nghĩa tham chiếu code/web, khác transport):
 * - Gọi đi: initiateCall -> server trả callInitiated (id thật) -> bên kia
 *   accept -> server phát callAccepted cho cả 2 -> bên ACCEPT là người
 *   chủ động tạo offer tới mọi người trong phòng (tránh glare).
 * - Gọi đến: incomingCall -> ringing (tự từ chối sau 30s) -> acceptCall
 *   -> callAccepted -> tạo offer.
 * - Nhóm đang live mà mình lỡ chuông: server báo `activeCall` khi vào
 *   đoạn chat -> nút Tham gia -> joinCall -> callAccepted -> tạo offer.
 * - Rời: endCall; caller rời / phòng trống / 1-1 có người rời -> server
 *   phát callEnded cho tất cả; thành viên nhóm rời -> chỉ nhận
 *   participantLeftCall, cuộc gọi tiếp tục.
 */
import { create } from "zustand";
import { toast } from "react-toastify";
import socket from "../plugins/socket";
import { useStoreUser } from "./user";
import { MeshCall, SignalData } from "../services/callPeer";

export type CallType = "voice" | "video";
export type CallState =
  | "idle"
  | "calling"
  | "ringing"
  | "joining"
  | "connected";

export interface CallParticipant {
  userId: string;
  userName: string;
  avatar?: string | null;
}

export interface CurrentCall {
  callId: string;
  conversationId: number;
  callType: CallType;
  isGroup: boolean;
  title: string;
  callerId: string;
  callerName: string;
  participants: CallParticipant[];
}

/** Cuộc gọi nhóm đang đổ chuông/live mà mình chưa vào — hiện nút Tham gia. */
export interface JoinableCall {
  callId: string;
  conversationId: number;
  callType: CallType;
  callerId: string;
  callerName: string;
  isGroup: boolean;
  participantCount?: number;
}

interface CallStoreState {
  callState: CallState;
  currentCall: CurrentCall | null;
  activeCall: JoinableCall | null;
  localStream: MediaStream | null;
  remoteStreams: Record<string, MediaStream>;
  isMuted: boolean;
  isVideoOff: boolean;
  callDuration: number;
  error: string | null;

  initiateCall: (
    conversationId: number,
    title: string,
    isGroup: boolean,
    callType: CallType
  ) => Promise<void>;
  acceptCall: () => Promise<void>;
  declineCall: () => void;
  joinCall: (callId: string) => Promise<void>;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;

  // Event server -> client (CallProvider đăng ký).
  handleCallInitiated: (data: any) => void;
  handleIncomingCall: (data: any) => void;
  handleCallAccepted: (data: any) => void;
  handleCallDeclined: (data: any) => void;
  handleCallEnded: (data: any) => void;
  handleUserBusy: (data: any) => void;
  handleParticipantJoinedCall: (data: any) => void;
  handleParticipantLeftCall: (data: any) => void;
  handleParticipantDeclinedCall: (data: any) => void;
  handleCallSignal: (data: any) => void;
  handleActiveCall: (data: any) => void;
  handleCallError: (data: any) => void;

  _cleanup: () => void;
}

let mesh: MeshCall | null = null;
let durationTimer: ReturnType<typeof setInterval> | null = null;
let ringTimer: ReturnType<typeof setTimeout> | null = null;
/** Vai trò của mình trong callAccepted sắp tới: caller chờ offer, joiner tạo offer. */
let myRole: "caller" | "joiner" | null = null;

const RING_TIMEOUT_MS = 30000;

function getMesh(): MeshCall {
  if (!mesh) {
    mesh = new MeshCall({
      onSignal: (toUserId, signal: SignalData) => {
        const callId = useCallStore.getState().currentCall?.callId;
        if (!callId) return;
        socket.emit("callSignal", { callId, toUserId, signal });
      },
      onRemoteStream: (userId, stream) => {
        useCallStore.setState((s) => ({
          remoteStreams: { ...s.remoteStreams, [userId]: stream },
        }));
      },
      onRemoteStreamRemoved: (userId) => {
        useCallStore.setState((s) => {
          const next = { ...s.remoteStreams };
          delete next[userId];
          return { remoteStreams: next };
        });
      },
    });
  }
  return mesh;
}

function stopTimers(): void {
  if (durationTimer) {
    clearInterval(durationTimer);
    durationTimer = null;
  }
  if (ringTimer) {
    clearTimeout(ringTimer);
    ringTimer = null;
  }
}

function startDurationTimer(): void {
  if (durationTimer) clearInterval(durationTimer);
  durationTimer = setInterval(() => {
    useCallStore.setState((s) => ({ callDuration: s.callDuration + 1 }));
  }, 1000);
}

function displayNameOf(conv: { title: string }): string {
  return conv.title;
}

/**
 * Lỗi getUserMedia -> câu tiếng Việt cụ thể cho user. Store không có
 * i18n (không phải component) nên chuỗi viết cứng như các error khác
 * trong file này; CallModal chỉ render store.error khi modal đã mở,
 * còn ở đây lỗi xảy ra TRƯỚC khi modal mở nên phải toast ngay — nếu
 * không user sẽ không thấy gì (lỗi (c)).
 */
function mediaAccessMessage(err: unknown): string {
  const name =
    err instanceof DOMException
      ? err.name
      : (err as { name?: string } | null)?.name;
  switch (name) {
    case "NotFoundError":
    case "DevicesNotFoundError":
      return "Không tìm thấy micro/camera trên thiết bị này.";
    case "NotAllowedError":
    case "PermissionDeniedError":
      return "Bạn đã từ chối quyền micro/camera. Bật quyền trong trình duyệt rồi thử lại.";
    case "NotReadableError":
    case "TrackStartError":
      return "Micro/camera đang bị ứng dụng khác chiếm. Đóng ứng dụng đó rồi thử lại.";
    case "OverconstrainedError":
      return "Thiết bị không đáp ứng được yêu cầu của cuộc gọi video.";
    default:
      return "Không truy cập được micro/camera. Kiểm tra quyền trình duyệt.";
  }
}

export const useCallStore = create<CallStoreState>((set, get) => ({
  callState: "idle",
  currentCall: null,
  activeCall: null,
  localStream: null,
  remoteStreams: {},
  isMuted: false,
  isVideoOff: false,
  callDuration: 0,
  error: null,

  _cleanup: () => {
    stopTimers();
    myRole = null;
    if (mesh) {
      mesh.closeAll();
      mesh = null;
    }
    set({
      callState: "idle",
      currentCall: null,
      localStream: null,
      remoteStreams: {},
      isMuted: false,
      isVideoOff: false,
      callDuration: 0,
      error: null,
    });
  },

  initiateCall: async (conversationId, title, isGroup, callType) => {
    const { callState, _cleanup } = get();
    if (callState !== "idle") return;
    const me = useStoreUser.getState().user;
    if (!me?.id) return;
    // (d) Chống gọi trùng: chuyển sang "calling" + đặt currentCall tạm
    // ĐỒNG BỘ, TRƯỚC await startLocal(). Lần bấm thứ 2 (double-click)
    // sẽ bị guard trên chặn ngay thay vì cả 2 cùng qua guard rồi cùng
    // emit lên server và bị server trả callError giết cả cuộc gọi đầu.
    // Đặt state trước cũng khiến nút gọi disable ngay (isDisabled theo
    // callState) và modal mở ngay trong lúc chờ lấy micro/camera.
    const pendingCall: CurrentCall = {
      callId: `temp-${Date.now()}`,
      conversationId,
      callType,
      isGroup,
      title: displayNameOf({ title }),
      callerId: me.id,
      callerName: me.fullName || me.username || "",
      participants: [
        { userId: me.id, userName: me.fullName || me.username || "" },
      ],
    };
    set({ error: null, callState: "calling", currentCall: pendingCall });
    let localStream: MediaStream;
    try {
      localStream = await getMesh().startLocal(callType);
    } catch (err) {
      // (c) startLocal throw khi không có thiết bị / bị từ chối quyền /
      // thiết bị đang bị chiếm: toast ngay (modal chưa mở nên error
      // trong store không ai thấy), rồi cleanup về idle để bấm lại được.
      const message = mediaAccessMessage(err);
      toast.error(message);
      set({ error: message });
      _cleanup();
      return;
    }
    myRole = "caller";
    set({ localStream });
    socket.emit(isGroup ? "initiateGroupCall" : "initiateCall", {
      conversationId,
      callType,
    });
    // Không ai bắt máy: server tự kết thúc sau 30s (callEnded/timeout).
    ringTimer = setTimeout(() => {
      const s = get();
      if (s.callState === "calling") {
        // (f) Toast TRƯỚC khi cleanup: cleanup unmount modal nên error
        // trong store sẽ vô hình; chỉ toast mới tới được user.
        // toastId chung với toast timeout của CallProvider để không hiện
        // 2 toast giống nhau khi server cũng gửi callEnded/timeout.
        toast.info("Không có người trả lời.", { toastId: "call-no-answer" });
        set({ error: "Không có người trả lời." });
        _cleanup();
      }
    }, RING_TIMEOUT_MS);
  },

  acceptCall: async () => {
    const { callState, currentCall, _cleanup } = get();
    if (callState !== "ringing" || !currentCall) return;
    if (ringTimer) {
      clearTimeout(ringTimer);
      ringTimer = null;
    }
    // (d) Như initiateCall: chuyển sang "joining" ĐỒNG BỘ trước await
    // để bấm Nghe máy 2 lần không tạo 2 lần accept.
    set({ callState: "joining" });
    let localStream: MediaStream;
    try {
      localStream = await getMesh().startLocal(currentCall.callType);
    } catch (err) {
      // (c) Như initiateCall: toast ngay vì cleanup sẽ unmount modal
      // chuông đến, error trong store không còn ai thấy.
      const message = mediaAccessMessage(err);
      toast.error(message);
      set({ error: message });
      _cleanup();
      return;
    }
    myRole = "joiner";
    set({ localStream });
    socket.emit("acceptCall", { callId: currentCall.callId });
  },

  declineCall: () => {
    const { callState, currentCall, _cleanup } = get();
    if (callState !== "ringing" || !currentCall) return;
    if (ringTimer) {
      clearTimeout(ringTimer);
      ringTimer = null;
    }
    const callId = currentCall.callId;
    const wasGroup = currentCall.isGroup;
    // Nhóm: từ chối chuông nhưng cuộc gọi vẫn live -> giữ nút Tham gia.
    if (wasGroup) {
      set((s) => ({
        activeCall: s.activeCall ?? {
          callId,
          conversationId: currentCall.conversationId,
          callType: currentCall.callType,
          callerId: currentCall.callerId,
          callerName: currentCall.callerName,
          isGroup: true,
        },
      }));
    }
    socket.emit("declineCall", { callId });
    _cleanup();
  },

  joinCall: async (callId) => {
    const { callState, activeCall, _cleanup } = get();
    if (callState !== "idle") return;
    const joinable =
      activeCall?.callId === callId ? activeCall : null;
    if (!joinable) return;
    const me = useStoreUser.getState().user;
    if (!me?.id) return;
    // (d) Như initiateCall: chuyển sang "joining" + đặt currentCall ĐỒNG
    // BỘ trước await để bấm Tham gia 2 lần không tạo 2 lần join.
    const pendingCall: CurrentCall = {
      callId,
      conversationId: joinable.conversationId,
      callType: joinable.callType,
      isGroup: joinable.isGroup,
      title: joinable.callerName,
      callerId: joinable.callerId,
      callerName: joinable.callerName,
      participants: [
        { userId: me.id, userName: me.fullName || me.username || "" },
      ],
    };
    set({
      error: null,
      callState: "joining",
      activeCall: null,
      currentCall: pendingCall,
    });
    let localStream: MediaStream;
    try {
      localStream = await getMesh().startLocal(joinable.callType);
    } catch (err) {
      // (c) Toast ngay (modal chưa kịp mở / sắp bị cleanup unmount);
      // khôi phục activeCall để user vẫn bấm Tham gia lại được.
      const message = mediaAccessMessage(err);
      toast.error(message);
      // _cleanup không động tới activeCall nên nút Tham gia còn nguyên.
      set({ error: message, activeCall: joinable });
      _cleanup();
      return;
    }
    myRole = "joiner";
    set({ localStream });
    socket.emit("joinCall", { callId });
    ringTimer = setTimeout(() => {
      const s = get();
      if (s.callState === "joining") {
        // (f) Như ringTimer của initiateCall: toast trước khi cleanup.
        toast.error("Không vào được cuộc gọi, thử lại sau.");
        set({ error: "Không vào được cuộc gọi, thử lại sau." });
        _cleanup();
      }
    }, RING_TIMEOUT_MS);
  },

  endCall: () => {
    const { currentCall, _cleanup } = get();
    if (!currentCall) return;
    const me = useStoreUser.getState().user;
    // Nhóm, mình không phải caller: cuộc gọi tiếp tục với người khác ->
    // giữ lại nút Tham gia để vào lại; server sẽ báo callEnded nếu
    // thực ra cuộc gọi đã kết thúc cho tất cả.
    if (
      currentCall.isGroup &&
      me?.id &&
      me.id !== currentCall.callerId
    ) {
      set({
        activeCall: {
          callId: currentCall.callId,
          conversationId: currentCall.conversationId,
          callType: currentCall.callType,
          callerId: currentCall.callerId,
          callerName: currentCall.callerName,
          isGroup: true,
        },
      });
    }
    socket.emit("endCall", { callId: currentCall.callId });
    _cleanup();
  },

  toggleMute: () => {
    const { isMuted, callState } = get();
    if (callState !== "connected") return;
    const next = !isMuted;
    mesh?.setMicEnabled(!next);
    set({ isMuted: next });
  },

  toggleVideo: () => {
    const { isVideoOff, callState, currentCall } = get();
    if (callState !== "connected") return;
    if (currentCall?.callType !== "video") return;
    const next = !isVideoOff;
    mesh?.setCameraEnabled(!next);
    set({ isVideoOff: next });
  },

  handleCallInitiated: (data) => {
    const { callState, currentCall } = get();
    if (callState !== "calling" || !currentCall) return;
    if (Number(data?.conversationId) !== currentCall.conversationId) return;
    set({
      currentCall: { ...currentCall, callId: String(data.callId) },
    });
  },

  handleIncomingCall: (data) => {
    const { callState } = get();
    if (callState !== "idle") return; // Đang trong call khác: server đã không ring mình nếu bận; bỏ qua.
    const me = useStoreUser.getState().user;
    const callId = String(data?.callId ?? "");
    if (!callId) return;
    set({
      callState: "ringing",
      error: null,
      currentCall: {
        callId,
        conversationId: Number(data.conversationId),
        callType: data.callType === "video" ? "video" : "voice",
        isGroup: !!data.isGroup,
        title: data.isGroup
          ? `Nhóm chat`
          : data.callerName || "Cuộc gọi đến",
        callerId: String(data.callerId ?? ""),
        callerName: data.callerName || "",
        participants: [
          {
            userId: String(data.callerId ?? ""),
            userName: data.callerName || "",
            avatar: data.callerAvatar ?? null,
          },
          ...(me?.id
            ? [{ userId: me.id, userName: me.fullName || me.username || "" }]
            : []),
        ],
      },
    });
    if (data.isGroup) {
      set((s) => ({
        activeCall: s.activeCall ?? {
          callId,
          conversationId: Number(data.conversationId),
          callType: data.callType === "video" ? "video" : "voice",
          callerId: String(data.callerId ?? ""),
          callerName: data.callerName || "",
          isGroup: true,
          participantCount: data.participantCount,
        },
      }));
    }
    if (ringTimer) clearTimeout(ringTimer);
    ringTimer = setTimeout(() => {
      get().declineCall();
    }, RING_TIMEOUT_MS);
  },

  handleCallAccepted: (data) => {
    const { callState, currentCall } = get();
    if (
      (callState !== "calling" && callState !== "joining") ||
      !currentCall
    ) {
      return;
    }
    if (String(data?.callId ?? "") !== currentCall.callId) return;
    if (ringTimer) {
      clearTimeout(ringTimer);
      ringTimer = null;
    }
    const participants: CallParticipant[] = Array.isArray(data.participants)
      ? data.participants
      : currentCall.participants;
    set({
      callState: "connected",
      callDuration: 0,
      currentCall: { ...currentCall, participants },
    });
    startDurationTimer();
    // Chỉ bên vừa vào (joiner) tạo offer tới mọi người trong phòng;
    // caller và những người đã ở trong chỉ answer.
    if (myRole === "joiner") {
      const me = useStoreUser.getState().user;
      const m = getMesh();
      for (const p of participants) {
        if (p.userId === me?.id) continue;
        m.createOffer(p.userId).catch(() => {
          // Offer lỗi (vd peer vừa rời): peer đó sẽ tự offer lại khi vào.
        });
      }
    }
    myRole = null;
  },

  handleCallDeclined: (data) => {
    const { currentCall, _cleanup } = get();
    if (!currentCall || String(data?.callId ?? "") !== currentCall.callId) {
      return;
    }
    set({ error: "Cuộc gọi bị từ chối." });
    _cleanup();
  },

  handleCallEnded: (data) => {
    const callId = String(data?.callId ?? "");
    const { currentCall, activeCall, _cleanup } = get();
    if (activeCall?.callId === callId) set({ activeCall: null });
    if (!currentCall || currentCall.callId !== callId) return;
    if (data?.reason === "timeout") {
      set({ error: "Không có người trả lời." });
    }
    _cleanup();
  },

  handleUserBusy: (data) => {
    const { currentCall, _cleanup } = get();
    if (!currentCall) return;
    if (
      data?.conversationId &&
      Number(data.conversationId) !== currentCall.conversationId
    ) {
      return;
    }
    set({ error: "Người này đang bận cuộc gọi khác." });
    _cleanup();
  },

  handleParticipantJoinedCall: (data) => {
    const { currentCall } = get();
    if (!currentCall || String(data?.callId ?? "") !== currentCall.callId) {
      return;
    }
    const userId = String(data.userId ?? "");
    if (!userId) return;
    set((s) => {
      if (!s.currentCall) return s;
      if (s.currentCall.participants.some((p) => p.userId === userId)) {
        return s;
      }
      return {
        currentCall: {
          ...s.currentCall,
          participants: [
            ...s.currentCall.participants,
            { userId, userName: data.userName || "" },
          ],
        },
      };
    });
  },

  handleParticipantLeftCall: (data) => {
    const { currentCall } = get();
    if (!currentCall || String(data?.callId ?? "") !== currentCall.callId) {
      return;
    }
    const userId = String(data.userId ?? "");
    if (!userId) return;
    mesh?.closePeer(userId);
    set((s) => {
      if (!s.currentCall) return s;
      const remoteStreams = { ...s.remoteStreams };
      delete remoteStreams[userId];
      return {
        remoteStreams,
        currentCall: {
          ...s.currentCall,
          participants: s.currentCall.participants.filter(
            (p) => p.userId !== userId
          ),
        },
      };
    });
  },

  handleParticipantDeclinedCall: () => {
    // Chỉ để caller biết ai đã từ chối — UI hiện tại không hiển thị
    // danh sách từ chối nên không đổi state.
  },

  handleCallSignal: (data) => {
    const { currentCall } = get();
    if (!currentCall || String(data?.callId ?? "") !== currentCall.callId) {
      return;
    }
    const fromUserId = String(data?.fromUserId ?? "");
    if (!fromUserId || !data?.signal) return;
    getMesh()
      .handleSignal(fromUserId, data.signal as SignalData)
      .catch(() => {
        // Signal lỗi thời (vd peer đã rời) — bỏ qua.
      });
  },

  handleActiveCall: (data) => {
    const { callState } = get();
    if (callState !== "idle") return;
    const callId = String(data?.callId ?? "");
    if (!callId) return;
    set({
      activeCall: {
        callId,
        conversationId: Number(data.conversationId),
        callType: data.callType === "video" ? "video" : "voice",
        callerId: String(data.callerId ?? ""),
        callerName: data.callerName || "",
        isGroup: !!data.isGroup,
        participantCount: data.participantCount,
      },
    });
  },

  handleCallError: (data) => {
    const { callState, _cleanup } = get();
    const message =
      typeof data?.message === "string" && data.message
        ? data.message
        : "Cuộc gọi gặp lỗi, thử lại sau.";
    set({ error: message });
    if (callState === "calling" || callState === "joining") _cleanup();
  },
}));
