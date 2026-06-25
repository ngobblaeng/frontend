"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Mic, MicOff, PhoneOff, Send, X } from "lucide-react";
import { getSocket } from "@/lib/socket";
import { useGameStore } from "@/store/gameStore";
import { createVoiceManager, VoiceManager } from "@/lib/voice";

type MicState = "idle" | "live" | "muted";

export function ChatBox() {
  const chat = useGameStore((s) => s.chat);
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastSeenRef = useRef(0);

  const [micState, setMicState] = useState<MicState>("idle");
  const voiceRef = useRef<VoiceManager | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});

  useEffect(() => {
    voiceRef.current = createVoiceManager({
      onPeerStream(peerId, stream) {
        setRemoteStreams((s) => ({ ...s, [peerId]: stream }));
      },
      onPeerLeft(peerId) {
        setRemoteStreams((s) => {
          const next = { ...s };
          delete next[peerId];
          return next;
        });
      },
      onError(message) {
        useGameStore.getState().setError(message);
        setMicState("idle");
      },
    });
    return () => {
      voiceRef.current?.leave();
    };
  }, []);

  async function toggleMic() {
    if (micState === "idle") {
      await voiceRef.current?.join();
      voiceRef.current?.setMuted(false);
      setMicState("live");
    } else if (micState === "live") {
      voiceRef.current?.setMuted(true);
      setMicState("muted");
    } else {
      voiceRef.current?.setMuted(false);
      setMicState("live");
    }
  }

  function leaveVoice() {
    voiceRef.current?.leave();
    setRemoteStreams({});
    setMicState("idle");
  }

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      lastSeenRef.current = chat.length;
      setUnread(0);
    } else {
      setUnread(chat.length - lastSeenRef.current);
    }
  }, [chat, open]);

  function send(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    getSocket().emit("chat:message", trimmed);
    setText("");
  }

  const voiceButton = (
    <button
      onClick={toggleMic}
      title={
        micState === "idle" ? "Join voice chat" : micState === "live" ? "Mute mic" : "Unmute mic to talk"
      }
      className={`inline-flex items-center justify-center rounded-full p-1.5 transition ${
        micState === "live"
          ? "text-emerald-400 hover:text-emerald-300"
          : "text-slate-400 hover:text-slate-200"
      }`}
    >
      {micState === "live" ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
    </button>
  );

  const remoteAudio = Object.entries(remoteStreams).map(([id, stream]) => (
    <audio
      key={id}
      autoPlay
      ref={(el) => {
        if (el) el.srcObject = stream;
      }}
    />
  ));

  if (!open) {
    return (
      <>
        {remoteAudio}
        <div className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-3 sm:bottom-6 sm:right-6 landscape:bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-slate-900/90 backdrop-blur px-1.5 py-1.5 shadow-lg">
            {voiceButton}
            {micState !== "idle" && (
              <button onClick={leaveVoice} title="Leave voice chat" className="text-slate-500 hover:text-rose-400 p-1">
                <PhoneOff className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 rounded-full bg-amber-500 p-3 sm:px-4 sm:py-3 font-semibold text-slate-950 shadow-xl shadow-amber-500/30 hover:bg-amber-400 transition"
          >
            <MessageCircle className="h-5 w-5" />
            {unread > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs text-white">
                {unread}
              </span>
            )}
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {remoteAudio}
      <div className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-3 left-3 sm:left-auto sm:bottom-6 sm:right-6 landscape:bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 flex w-auto sm:w-72 flex-col h-64 sm:h-80 max-h-[60vh] rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur shadow-2xl overflow-hidden animate-fade-up">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
        <p className="text-sm font-semibold text-slate-200">Room chat</p>
        <div className="flex items-center gap-1">
          {voiceButton}
          {micState !== "idle" && (
            <button onClick={leaveVoice} title="Leave voice chat" className="text-slate-500 hover:text-rose-400 p-1">
              <PhoneOff className="h-3.5 w-3.5" />
            </button>
          )}
          <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-200">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 text-sm">
        {chat.length === 0 && <p className="text-slate-500 text-xs">No messages yet — say hi 👋</p>}
        {chat.map((m, i) => (
          <p key={i} className="leading-snug">
            <span className="font-semibold text-amber-400">{m.name}: </span>
            <span className="text-slate-200">{m.text}</span>
          </p>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="flex border-t border-white/10">
        <input
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={280}
          placeholder="Say something… 😀"
          className="flex-1 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-slate-500"
        />
        <button type="submit" className="px-3 text-amber-400 hover:text-amber-300">
          <Send className="h-4 w-4" />
        </button>
      </form>
      </div>
    </>
  );
}
