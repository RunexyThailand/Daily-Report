import { axiosClient } from "@/lib/axios.client";
import { buildTranslatePrompt } from "./chat-prompt";

export type TranslationResult = {
  sourceLang: string;
  targetLang: string;
  sourceText: string;
  translatedText: string;
};

export async function onCallChat(textOrHtml: string, targetLang: string) {
  const content = buildTranslatePrompt(textOrHtml, targetLang);

  const body = {
    model: "gemma3n",
    stream: false,
    messages: [{ role: "user", content }],
  };

  const { data } = await axiosClient.post("/api/chat", body);

  return data.message.content || "";
}
