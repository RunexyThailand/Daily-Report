import { axiosClient } from "@/lib/axios.client";
import { buildTranslatePrompt, buildTranslatePromptText } from "./chat-prompt";

export type TranslationResult = {
  sourceLang: string;
  targetLang: string;
  sourceText: string;
  translatedText: string;
};

export async function onCallChat(
  textOrHtml: string,
  targetLang: string,
  isHtml: boolean = false,
) {
  const content = isHtml
    ? buildTranslatePrompt(textOrHtml, targetLang)
    : buildTranslatePromptText(textOrHtml, targetLang);

  const body = {
    model: "gemma3n",
    stream: false,
    messages: [{ role: "user", content }],
  };

  const { data } = await axiosClient.post("/api/chat", body);

  return data.message.content || "";
}
