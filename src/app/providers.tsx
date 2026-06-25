"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { initSoundPreference, playWelcome } from "@/lib/sound";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());

  useEffect(() => {
    initSoundPreference();
    // browsers block audio until the visitor interacts with the page —
    // play a one-time welcome chime on the first click/keypress/touch
    function onFirstInteraction() {
      playWelcome();
      window.removeEventListener("pointerdown", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
    }
    window.addEventListener("pointerdown", onFirstInteraction, { once: true });
    window.addEventListener("keydown", onFirstInteraction, { once: true });
    return () => {
      window.removeEventListener("pointerdown", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
    };
  }, []);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
