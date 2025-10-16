import { axiosClient } from "@/lib/axios.client";
import { buildTranslatePrompt, buildTranslatePromptText } from "./chat-prompt";
import { stripHtml } from "@/utils/strip-html";

export type TranslationResult = {
  sourceLang: string;
  targetLang: string;
  sourceText: string;
  translatedText: string;
};

export const detactLanguageByGemma3n = async (text: string) => {
  const plain = stripHtml(text);

  const content = [
    "You are a language detector.",
    "Task: Analyze the TEXT and output only the ISO 639-1 code of its primary language.",
    "Allowed outputs: en, ja, th, und",
    "Rules: Output exactly one of the allowed codes with no explanations, no punctuation, no extra whitespace.",
    "TEXT:",
    plain,
  ].join("\n");

  const body = {
    model: "gemma3n",
    stream: false,
    messages: [{ role: "user", content }],
  };

  const { data } = await axiosClient.post("/api/chat", body);
  return data?.message?.content ?? "";
};

export async function onTranslateByGemma3n(
  textOrHtml: string,
  // targetLang: string,
  // isHtml: boolean = false,
) {
  // const content = isHtml
  //   ? buildTranslatePrompt(textOrHtml, targetLang)
  //   : buildTranslatePromptText(textOrHtml, targetLang);
  // const body = {
  //   model: "gemma3n",
  //   stream: false,
  //   messages: [{ role: "user", content }],
  // };
  // const { data } = await axiosClient.post("/api/chat", body);
  // return data.message.content || "";
}

// export async function onTranslateByGemma3n(
//   textOrHtml: string,
//   targetLang: string,
//   isHtml: boolean = false,
// ) {
//   const content = isHtml
//     ? buildTranslatePrompt(textOrHtml, targetLang)
//     : buildTranslatePromptText(textOrHtml, targetLang);

//   const body = {
//     model: "gemma3n",
//     stream: false,
//     messages: [{ role: "user", content }],
//   };

//   const { data } = await axiosClient.post("/api/chat", body);

//   return data.message.content || "";
// }
