// Gera src/data/product-sentences.en.json (frases únicas do catálogo, em ordem de
// aparição) e valida os blocos de tradução src/data/product-sentences.pt-*.json.
//
//   node scripts/build-product-sentences.mjs          # gera + valida
//   node scripts/build-product-sentences.mjs --list   # imprime a lista numerada (tradução)
//
// A ordem do array é a ordem de primeira aparição no catálogo. Cada bloco de tradução
// carrega o checksum das frases que traduz, então qualquer mudança no catálogo é
// detectada na validação em vez de silenciosamente bagunçar o alinhamento.

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const catalogPath = join(root, "src", "data", "catalog.ts");
const dataDir = join(root, "src", "data");
const enPath = join(dataDir, "product-sentences.en.json");

/** O runtime usa exatamente esta normalização e este corte de frase. */
export function splitSentences(text) {
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

function extractInfos(source) {
  const infos = [];
  const re = /info: "((?:[^"\\]|\\.)*)"/g;
  let match;
  while ((match = re.exec(source)) !== null) {
    infos.push(JSON.parse(`"${match[1]}"`));
  }
  return infos;
}

const catalogSource = readFileSync(catalogPath, "utf8");
const infos = extractInfos(catalogSource);

const seen = new Map();
for (const info of infos) {
  for (const sentence of splitSentences(info)) {
    if (!seen.has(sentence)) seen.set(sentence, seen.size);
  }
}

const sentences = [...seen.keys()];
writeFileSync(enPath, `${JSON.stringify(sentences, null, 1)}\n`, "utf8");

const checksum = (list) =>
  createHash("sha256").update(list.join("\u0000")).digest("hex").slice(0, 16);

if (process.argv.includes("--list")) {
  sentences.forEach((sentence, index) => {
    console.log(`${index}\t${sentence}`);
  });
  console.log(`\nTOTAL ${sentences.length}`);
  console.log(`RANGE_CHECKSUMS ${JSON.stringify(chunkChecksums(sentences))}`);
}

// ---------------------------------------------------------------- validação
function chunkChecksums(list) {
  const size = 141;
  const out = [];
  for (let from = 0; from < list.length; from += size) {
    const to = Math.min(list.length, from + size);
    out.push({ from, to, checksum: checksum(list.slice(from, to)) });
  }
  return out;
}

const chunkFiles = existsSync(dataDir)
  ? readdirSync(dataDir)
      .filter((file) => /^product-sentences\.pt-\d+\.json$/.test(file))
      .sort()
  : [];

let translated = 0;
const problems = [];

for (const file of chunkFiles) {
  const chunk = JSON.parse(readFileSync(join(dataDir, file), "utf8"));
  const from = chunk.from;
  const to = chunk.to;
  const expected = sentences.slice(from, to);

  if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to > sentences.length) {
    problems.push(`${file}: faixa inválida ${from}..${to}`);
    continue;
  }
  if (chunk.sentences.length !== expected.length) {
    problems.push(
      `${file}: ${chunk.sentences.length} frases, esperado ${expected.length} (faixa ${from}..${to})`,
    );
    continue;
  }
  if (chunk.checksum !== checksum(expected)) {
    problems.push(`${file}: checksum divergente — o catálogo mudou depois da tradução`);
    continue;
  }
  translated += chunk.sentences.length;
}

const coverage = ((translated / sentences.length) * 100).toFixed(1);
console.log(`frases: ${sentences.length} | traduzidas: ${translated} (${coverage}%)`);
if (problems.length > 0) {
  console.error("problemas:\n- " + problems.join("\n- "));
  process.exitCode = 1;
}
