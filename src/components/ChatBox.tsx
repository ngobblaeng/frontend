"use client";

import { useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";
import { useGameStore } from "@/store/gameStore";

export function ChatBox() {
  const chat = useGameStore((s) => s.chat);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  function send(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    getSocket().emit("chat:message", trimmed);
    setText("");
  }

  return (
    <div className="flex flex-col h-64 rounded-lg border border-slate-700 bg-slate-900">
      <div className="flex-1 overflow-y-auto p-3 space-y-1 text-sm">
        {chat.map((m, i) => (
          <p key={i}>
            <span className="font-semibold text-amber-400">{m.name}: </span>
            <span className="text-slate-200">{m.text}</span>
          </p>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="flex border-t border-slate-700">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={280}
          placeholder="Say something… 😀"
          className="flex-1 bg-transparent px-3 py-2 text-sm outline-none"
        />
        <button type="submit" className="px-4 text-sm text-amber-400 hover:text-amber-300">
          Send
        </button>
      </form>
    </div>
  );
}
