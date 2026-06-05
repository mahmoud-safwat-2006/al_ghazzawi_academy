"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Square, Volume2 } from "lucide-react";

interface Props {
  /** the raw HTML to read — tags are stripped automatically */
  html: string;
}

const RATES = [0.8, 1.0, 1.25, 1.5] as const;

/** Extract readable Arabic/English text from the summary HTML. */
function htmlToSpeech(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<\/(p|h\d|li|div|blockquote|tr)>/gi, ". ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\.+/g, ".")
    .replace(/\s+/g, " ")
    .trim();
}

export function SpeechController({ html }: Props) {
  const [supported, setSupported] = useState(true);
  const [status, setStatus] = useState<"idle" | "playing" | "paused">("idle");
  const [rate, setRate] = useState<number>(1.0);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setSupported(false);
    }
  }, []);

  // Stop speech if the component unmounts (e.g., user navigates away).
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Re-apply rate to an in-flight utterance by restarting it (Web Speech API
  // doesn't allow changing rate on a live utterance).
  function changeRate(next: number) {
    setRate(next);
    if (status === "playing") {
      window.speechSynthesis.cancel();
      setTimeout(() => play(next), 50);
    }
  }

  function play(useRate = rate) {
    if (!supported) return;
    const text = htmlToSpeech(html);
    if (!text) return;
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "ar-SA";
    utter.rate = useRate;
    utter.onend = () => setStatus("idle");
    utter.onerror = () => setStatus("idle");

    // Try to pick an Arabic voice if available
    const voices = window.speechSynthesis.getVoices();
    const ar =
      voices.find((v) => v.lang.startsWith("ar")) ||
      voices.find((v) => /arabic/i.test(v.name));
    if (ar) utter.voice = ar;

    utterRef.current = utter;
    window.speechSynthesis.speak(utter);
    setStatus("playing");
  }

  function pause() {
    if (!supported) return;
    window.speechSynthesis.pause();
    setStatus("paused");
  }

  function resume() {
    if (!supported) return;
    window.speechSynthesis.resume();
    setStatus("playing");
  }

  function stop() {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setStatus("idle");
  }

  if (!supported) return null;

  return (
    <div className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-card p-1">
      {status === "idle" && (
        <button
          onClick={() => play()}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold text-cyan-700 hover:bg-cyan-50 transition-colors"
          aria-label="قراءة صوتية"
        >
          <Volume2 className="size-3.5" />
          استمع
        </button>
      )}
      {status === "playing" && (
        <>
          <button
            onClick={pause}
            className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-50 transition-colors"
            aria-label="إيقاف مؤقت"
          >
            <Pause className="size-3.5" />
            إيقاف
          </button>
          <button
            onClick={stop}
            className="inline-flex items-center justify-center size-7 rounded-md text-muted hover:bg-border/40 transition-colors"
            aria-label="إنهاء"
          >
            <Square className="size-3" />
          </button>
        </>
      )}
      {status === "paused" && (
        <>
          <button
            onClick={resume}
            className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold text-cyan-700 hover:bg-cyan-50 transition-colors"
            aria-label="متابعة"
          >
            <Play className="size-3.5" />
            متابعة
          </button>
          <button
            onClick={stop}
            className="inline-flex items-center justify-center size-7 rounded-md text-muted hover:bg-border/40 transition-colors"
            aria-label="إنهاء"
          >
            <Square className="size-3" />
          </button>
        </>
      )}
      <div className="inline-flex border-l border-border/60 ms-0.5 ps-1.5 gap-0.5">
        {RATES.map((r) => (
          <button
            key={r}
            onClick={() => changeRate(r)}
            className={`text-[10px] font-bold rounded px-1.5 py-0.5 transition-colors ${
              rate === r
                ? "bg-cyan-600 text-white"
                : "text-muted hover:text-foreground"
            }`}
            aria-label={`سرعة ${r}x`}
          >
            {r}x
          </button>
        ))}
      </div>
    </div>
  );
}
