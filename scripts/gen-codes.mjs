#!/usr/bin/env node
/**
 * توليد أكواد تفعيل ورفعها إلى الدفتر المركزي (Supabase).
 *
 * الاستخدام (من جذر المشروع):
 *   node scripts/gen-codes.mjs --count=50 --devices=2
 *   node scripts/gen-codes.mjs --count=10 --devices=1 --note="دفعة يونيو"
 *
 * يقرأ SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY من .env.local، يولّد أكواداً
 * فريدة بصيغة AGZ-XXXX-XXXX (بأحرف بلا التباس)، ويُدرجها بحالة غير مُستخدمة،
 * ثم يطبعها لتسلّمها للمشترين.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

// تحميل .env.local يدوياً (دون أي اعتماد خارجي).
function loadEnv() {
  try {
    const txt = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of txt.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    /* لا ملف .env.local — نعتمد على متغيرات البيئة الموجودة */
  }
}
loadEnv();

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  }),
);
const count = parseInt(args.count ?? "50", 10);
const maxDevices = parseInt(args.devices ?? "2", 10);
const note = typeof args.note === "string" ? args.note : null;

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error(
    "✗ متغيرات Supabase مفقودة. ضع SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY في .env.local",
  );
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

// أبجدية بلا أحرف ملتبسة (لا 0/O/1/I) — 32 رمزاً تقسم 256 بالتساوي (بلا تحيّز).
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function block() {
  const b = randomBytes(4);
  let s = "";
  for (let i = 0; i < 4; i++) s += ALPHABET[b[i] % ALPHABET.length];
  return s;
}
const genCode = () => `AGZ-${block()}-${block()}`;

const codes = new Set();
while (codes.size < count) codes.add(genCode());

const rows = [...codes].map((code) => ({
  code,
  max_devices: maxDevices,
  ...(note ? { note } : {}),
}));

const { error } = await supabase.from("access_codes").insert(rows);
if (error) {
  console.error("✗ فشل الإدراج:", error.message);
  process.exit(1);
}

console.log(`\n✓ تم توليد ${count} كود (حدّ ${maxDevices} جهاز لكل كود):\n`);
for (const code of codes) console.log("   " + code);
console.log("\nسلّم كل مشترٍ كوداً واحداً. تابع الاستخدام من جدول access_codes في Supabase.\n");
