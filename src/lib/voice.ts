"use client";

// Live, peer-to-peer voice chat over WebRTC. The signaling server only
// relays SDP offers/answers and ICE candidates between players in the same
// room — audio itself flows directly between browsers and is never recorded
// or stored anywhere.

import { getSocket } from "./socket";

const ICE_SERVERS: RTCIceServer[] = [{ urls: "stun:stun.l.google.com:19302" }];

type SignalData =
  | { kind: "offer"; sdp: RTCSessionDescriptionInit }
  | { kind: "answer"; sdp: RTCSessionDescriptionInit }
  | { kind: "ice"; candidate: RTCIceCandidateInit };

export interface VoiceManager {
  join(): Promise<void>;
  leave(): void;
  setMuted(muted: boolean): void;
}

export interface VoiceCallbacks {
  onPeerStream(peerId: string, stream: MediaStream): void;
  onPeerLeft(peerId: string): void;
  onError(message: string): void;
}

export function createVoiceManager(callbacks: VoiceCallbacks): VoiceManager {
  const socket = getSocket();
  let localStream: MediaStream | null = null;
  const peers = new Map<string, RTCPeerConnection>();
  let joined = false;

  function makePeerConnection(peerId: string): RTCPeerConnection {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    if (localStream) {
      for (const track of localStream.getTracks()) pc.addTrack(track, localStream);
    }
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("voice:signal", { to: peerId, data: { kind: "ice", candidate: e.candidate.toJSON() } });
      }
    };
    pc.ontrack = (e) => {
      callbacks.onPeerStream(peerId, e.streams[0]);
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed" || pc.connectionState === "closed") {
        closePeer(peerId);
      }
    };
    peers.set(peerId, pc);
    return pc;
  }

  function closePeer(peerId: string): void {
    const pc = peers.get(peerId);
    if (pc) {
      pc.close();
      peers.delete(peerId);
    }
    callbacks.onPeerLeft(peerId);
  }

  async function offerTo(peerId: string): Promise<void> {
    const pc = peers.get(peerId) ?? makePeerConnection(peerId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("voice:signal", { to: peerId, data: { kind: "offer", sdp: offer } });
  }

  async function handleSignal(from: string, data: SignalData): Promise<void> {
    if (data.kind === "offer") {
      const pc = peers.get(from) ?? makePeerConnection(from);
      await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("voice:signal", { to: from, data: { kind: "answer", sdp: answer } });
    } else if (data.kind === "answer") {
      const pc = peers.get(from);
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
    } else if (data.kind === "ice") {
      const pc = peers.get(from);
      if (pc) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch {
          // candidate arrived before the remote description — safe to ignore
        }
      }
    }
  }

  function onSignal({ from, data }: { from: string; data: SignalData }) {
    void handleSignal(from, data);
  }

  function onPeerJoined({ peerId }: { peerId: string }) {
    void offerTo(peerId);
  }

  function onPeerLeft({ peerId }: { peerId: string }) {
    closePeer(peerId);
  }

  function onPeers({ peers: existing }: { peers: string[] }) {
    existing.forEach((peerId) => void offerTo(peerId));
  }

  return {
    async join() {
      if (joined) return;
      try {
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        callbacks.onError("Microphone access was denied or unavailable");
        return;
      }
      joined = true;
      socket.on("voice:signal", onSignal);
      socket.on("voice:peer-joined", onPeerJoined);
      socket.on("voice:peer-left", onPeerLeft);
      socket.on("voice:peers", onPeers);
      socket.emit("voice:join");
    },
    leave() {
      if (!joined) return;
      joined = false;
      socket.emit("voice:leave");
      socket.off("voice:signal", onSignal);
      socket.off("voice:peer-joined", onPeerJoined);
      socket.off("voice:peer-left", onPeerLeft);
      socket.off("voice:peers", onPeers);
      for (const peerId of [...peers.keys()]) closePeer(peerId);
      localStream?.getTracks().forEach((t) => t.stop());
      localStream = null;
    },
    setMuted(muted: boolean) {
      localStream?.getAudioTracks().forEach((t) => (t.enabled = !muted));
    },
  };
}
