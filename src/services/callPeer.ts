/**
 * P2.4 — Mesh WebRTC (không SFU, không thêm dependency).
 *
 * Mỗi người tham gia mở 1 RTCPeerConnection tới từng người khác; người
 * vừa vào cuộc gọi (accept/join) là bên chủ động tạo offer tới mọi người
 * đã ở trong phòng — bên kia chỉ answer, tránh glare (cả 2 cùng offer).
 * Mic/camera tắt/mở bằng track.enabled (đơn giản, không cần renegotiate).
 *
 * Giới hạn (ghi rõ): chỉ có STUN công khai của Google, không có TURN —
 * sau NAT đối xứng cuộc gọi có thể không nối được; mesh nên tối đa
 * 6 người (server đã chặn ở MAX_CALL_PARTICIPANTS). Không ghi âm.
 */

export type CallType = "voice" | "video";

export interface SignalData {
  type: "offer" | "answer" | "candidate";
  sdp?: string;
  candidate?: RTCIceCandidateInit | null;
}

export interface MeshCallEvents {
  /** Gửi signal tới 1 peer (store chuyển thành socket `callSignal`). */
  onSignal: (toUserId: string, signal: SignalData) => void;
  onRemoteStream: (userId: string, stream: MediaStream) => void;
  onRemoteStreamRemoved: (userId: string) => void;
}

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
];

export class MeshCall {
  private pcs = new Map<string, RTCPeerConnection>();
  private remoteStreams = new Map<string, MediaStream>();
  private pendingCandidates = new Map<string, RTCIceCandidateInit[]>();
  private localStream: MediaStream | null = null;

  constructor(private events: MeshCallEvents) {}

  async startLocal(callType: CallType): Promise<MediaStream> {
    this.localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video:
        callType === "video"
          ? { width: { ideal: 1280 }, height: { ideal: 720 } }
          : false,
    });
    return this.localStream;
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  setMicEnabled(enabled: boolean): void {
    this.localStream?.getAudioTracks().forEach((t) => {
      t.enabled = enabled;
    });
  }

  setCameraEnabled(enabled: boolean): void {
    this.localStream?.getVideoTracks().forEach((t) => {
      t.enabled = enabled;
    });
  }

  private ensurePeer(userId: string): RTCPeerConnection {
    const existing = this.pcs.get(userId);
    if (existing) return existing;
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    if (this.localStream) {
      for (const track of this.localStream.getTracks()) {
        pc.addTrack(track, this.localStream);
      }
    }
    pc.onicecandidate = (e) => {
      this.events.onSignal(userId, {
        type: "candidate",
        candidate: e.candidate ? e.candidate.toJSON() : null,
      });
    };
    pc.ontrack = (e) => {
      let stream = this.remoteStreams.get(userId);
      if (!stream) {
        stream = new MediaStream();
        this.remoteStreams.set(userId, stream);
      }
      const track = e.track;
      if (!stream.getTracks().some((t) => t.id === track.id)) {
        stream.addTrack(track);
      }
      this.events.onRemoteStream(userId, stream);
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed") {
        // ICE thất bại (vd NAT đối xứng, không có TURN): đóng peer để UI
        // không treo ở trạng thái "đang kết nối" mãi.
        this.closePeer(userId);
      }
    };
    this.pcs.set(userId, pc);
    return pc;
  }

  async createOffer(userId: string): Promise<void> {
    const pc = this.ensurePeer(userId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    this.events.onSignal(userId, { type: "offer", sdp: offer.sdp });
  }

  async handleSignal(fromUserId: string, signal: SignalData): Promise<void> {
    const pc = this.ensurePeer(fromUserId);
    if (signal.type === "offer") {
      await pc.setRemoteDescription(
        new RTCSessionDescription({ type: "offer", sdp: signal.sdp })
      );
      await this.flushCandidates(fromUserId, pc);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      this.events.onSignal(fromUserId, { type: "answer", sdp: answer.sdp });
      return;
    }
    if (signal.type === "answer") {
      await pc.setRemoteDescription(
        new RTCSessionDescription({ type: "answer", sdp: signal.sdp })
      );
      await this.flushCandidates(fromUserId, pc);
      return;
    }
    if (signal.type === "candidate" && signal.candidate) {
      const candidate = new RTCIceCandidate(signal.candidate);
      if (pc.remoteDescription) {
        await pc.addIceCandidate(candidate);
      } else {
        // Candidate tới trước remoteDescription: xếp hàng chờ.
        const queued = this.pendingCandidates.get(fromUserId) ?? [];
        queued.push(signal.candidate);
        this.pendingCandidates.set(fromUserId, queued);
      }
    }
  }

  private async flushCandidates(
    userId: string,
    pc: RTCPeerConnection
  ): Promise<void> {
    const queued = this.pendingCandidates.get(userId);
    if (!queued || queued.length === 0) return;
    this.pendingCandidates.delete(userId);
    for (const c of queued) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(c));
      } catch {
        // Candidate lỗi thời — bỏ qua, ICE vẫn nối được bằng candidate khác.
      }
    }
  }

  closePeer(userId: string): void {
    const pc = this.pcs.get(userId);
    if (pc) {
      pc.close();
      this.pcs.delete(userId);
    }
    this.pendingCandidates.delete(userId);
    if (this.remoteStreams.has(userId)) {
      this.remoteStreams.delete(userId);
      this.events.onRemoteStreamRemoved(userId);
    }
  }

  closeAll(): void {
    for (const userId of Array.from(this.pcs.keys())) {
      this.closePeer(userId);
    }
    this.remoteStreams.clear();
    this.pendingCandidates.clear();
    if (this.localStream) {
      for (const track of this.localStream.getTracks()) track.stop();
      this.localStream = null;
    }
  }
}
