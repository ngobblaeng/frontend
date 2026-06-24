"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { getSocket } from "@/lib/socket";
import { useGameStore } from "@/store/gameStore";

export function ChatBox() {
  const chat = useGameStore((s) => s.chat);
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastSeenRef = useRef(0);

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

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-30 flex items-center gap-2 rounded-full bg-amber-500 px-4 py-3 font-semibold text-slate-950 shadow-xl shadow-amber-500/30 hover:bg-amber-400 transition"
      >
        <MessageCircle className="h-5 w-5" />
        {unread > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs text-white">
            {unread}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-30 flex w-72 flex-col h-80 rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur shadow-2xl overflow-hidden animate-fade-up">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
        <p className="text-sm font-semibold text-slate-200">Room chat</p>
        <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-200">
          <X className="h-4 w-4" />
        </button>
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
  );
}
