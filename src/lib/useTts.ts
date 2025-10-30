// src/lib/useTTS.ts
import { useCallback, useEffect, useRef, useState } from "react";

export type TTSOptions = {
  lang?: string; // e.g. "ja-JP" | "th-TH" | "en-US"
  rate?: number; // 0.1 - 10 (1 = ปกติ)
  pitch?: number; // 0 - 2   (1 = ปกติ)
  volume?: number; // 0 - 1
  voiceName?: string; // ตั้งชื่อ voice ที่ต้องการ (optional)
};

export function useTTS(defaults: TTSOptions = {}) {
  const [supported, setSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const speakingRef = useRef(false);

  const loadVoices = useCallback(() => {
    const list = window.speechSynthesis.getVoices() || [];
    setVoices(list);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ok = typeof window.speechSynthesis !== "undefined";
    setSupported(ok);
    if (!ok) return;

    loadVoices();
    // บราว์เซอร์บางตัวจะโหลดเสียงช้า ต้องรอฟัง event
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [loadVoices]);

  const pickVoice = useCallback(
    (lang?: string, voiceName?: string) => {
      if (!voices.length) return null;
      if (voiceName) {
        const v = voices.find((x) => x.name === voiceName);
        if (v) return v;
      }
      if (lang) {
        // พยายามจับคู่แบบ exact ก่อน แล้วค่อย fallback แค่ตามรหัสภาษา (เช่น "ja")
        const exact = voices.find(
          (v) => v.lang.toLowerCase() === lang.toLowerCase(),
        );
        if (exact) return exact;
        const base = lang.split("-")[0].toLowerCase();
        const partial = voices.find((v) =>
          v.lang.toLowerCase().startsWith(base),
        );
        if (partial) return partial;
      }
      // สุดท้ายเอา default system
      return voices[0] || null;
    },
    [voices],
  );

  const speak = useCallback(
    (text: string, opts: TTSOptions = {}) => {
      if (!supported || !text?.trim()) return;
      const {
        lang = defaults.lang,
        rate = defaults.rate ?? 1,
        pitch = defaults.pitch ?? 1,
        volume = defaults.volume ?? 1,
        voiceName = defaults.voiceName,
      } = opts;

      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = rate;
      utter.pitch = pitch;
      utter.volume = volume;
      if (lang) utter.lang = lang;
      const voice = pickVoice(lang, voiceName);
      if (voice) utter.voice = voice;

      speakingRef.current = true;
      setSpeaking(true);
      utter.onend = () => {
        speakingRef.current = false;
        setSpeaking(false);
      };
      utter.onerror = () => {
        speakingRef.current = false;
        setSpeaking(false);
      };

      window.speechSynthesis.speak(utter);
    },
    [
      supported,
      defaults.lang,
      defaults.rate,
      defaults.pitch,
      defaults.volume,
      defaults.voiceName,
      pickVoice,
    ],
  );

  const cancel = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    speakingRef.current = false;
    setSpeaking(false);
  }, [supported]);

  const pause = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.pause();
  }, [supported]);

  const resume = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.resume();
  }, [supported]);

  return {
    supported,
    voices,
    speak,
    cancel,
    pause,
    resume,
    pickVoice,
    speaking,
  };
}
