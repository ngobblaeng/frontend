"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { isSoundEnabled, setSoundEnabled, initSoundPreference } from "@/lib/sound";

export function SoundToggle({ className }: { className?: string }) {
  const [on, setOn] = useState(true);

  useEffect(() => {
    initSoundPreference();
    setOn(isSoundEnabled());
  }, []);

  function toggle() {
    const next = !on;
    setOn(next);
    setSoundEnabled(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={on ? "Mute sound" : "Unmute sound"}
      className={`inline-flex items-center justify-center rounded-lg p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition ${className ?? ""}`}
    >
      {on ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
    </button>
  );
}
