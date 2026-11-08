import enSentences from "@/data/product-sentences.en.json";
import ptChunk1 from "@/data/product-sentences.pt-1.json";
import ptChunk2 from "@/data/product-sentences.pt-2.json";
import ptChunk3 from "@/data/product-sentences.pt-3.json";
import type { Lang } from "./types";

type SentenceChunk = {
  from: number;
  to: number;
  checksum: string;
  sentences: string[];
};

const CHUNKS: SentenceChunk[] = [ptChunk1, ptChunk2, ptChunk3];

/** frase em inglês -> frase traduzida. */
const TRANSLATIONS = new Map<string, string>();

for (const chunk of CHUNKS) {
  for (let index = 0; index < chunk.sentences.length; index++) {
    const source = enSentences[chunk.from + index];
    const translated = chunk.sentences[index];
    if (source && translated) TRANSLATIONS.set(source, translated);
  }
}

/** Mesma normalização e o mesmo corte de frase do script de build. */
export function splitSentences(text: string): string[] {
  const normalized = text
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!normalized) return [];
  return normalized
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 3);
}

/**
 * Traduz a descrição longa do produto frase a frase. Frases sem tradução (por
 * exemplo quando o texto veio editado do banco) continuam no original, então a
 * página nunca fica quebrada.
 */
export function translateProductText(text: string, lang: Lang): string {
  if (lang === "en" || !text) return text;

  return splitSentences(text)
    .map((sentence) => TRANSLATIONS.get(sentence) ?? sentence)
    .join(" ");
}

export const TRANSLATED_SENTENCE_COUNT = TRANSLATIONS.size;
export const TOTAL_SENTENCE_COUNT = enSentences.length;
