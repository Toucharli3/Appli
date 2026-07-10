#!/usr/bin/env node
/* =========================================================
   Build step — compile content/articles/*.md into
   data/articles.json so the static blog can list them.
   Runs locally and in CI (before the Pages deploy).
   Zero dependencies.
   ========================================================= */
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CONTENT_DIR = join(ROOT, "content", "articles");
const OUT_DIR = join(ROOT, "data");
const OUT_FILE = join(OUT_DIR, "articles.json");

/* Minimal YAML front-matter parser (flat key: "value" pairs). */
function parseFrontMatter(raw) {
  const text = raw.replace(/^﻿/, "").replace(/\r\n/g, "\n");
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(text);
  if (!m) return { data: {}, body: text.trim() };
  const data = {};
  for (const line of m[1].split("\n")) {
    const kv = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line);
    if (!kv) continue;
    let val = kv[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1).replace(/\\"/g, '"');
    }
    data[kv[1]] = val;
  }
  return { data, body: text.slice(m[0].length).trim() };
}

function slugFromName(name) {
  return name.replace(/\.md$/i, "");
}

function excerptFrom(body) {
  return body.replace(/[#*>`\-]/g, "").replace(/\s+/g, " ").trim().slice(0, 160) + "…";
}

async function main() {
  if (!existsSync(OUT_DIR)) await mkdir(OUT_DIR, { recursive: true });

  let files = [];
  if (existsSync(CONTENT_DIR)) {
    files = (await readdir(CONTENT_DIR)).filter((f) => f.toLowerCase().endsWith(".md"));
  }

  const articles = [];
  for (const file of files) {
    const raw = await readFile(join(CONTENT_DIR, file), "utf8");
    const { data, body } = parseFrontMatter(raw);
    if (!data.title && !body) continue;
    articles.push({
      slug: data.slug || slugFromName(file),
      title: data.title || slugFromName(file),
      category: data.category || "Article",
      author: data.author || "Anne-Sophie",
      date: data.date || new Date().toISOString().slice(0, 10),
      cover: data.cover || "",
      excerpt: data.excerpt || excerptFrom(body),
      body,
    });
  }

  articles.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  await writeFile(OUT_FILE, JSON.stringify(articles, null, 2) + "\n", "utf8");
  console.log(`✓ ${articles.length} article(s) → data/articles.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
