#!/usr/bin/env node
/**
 * حذف أكواد من الدفتر (لإعادة الضبط أو تنظيف أكواد الاختبار).
 *
 * الاستخدام:
 *   node scripts/clear-codes.mjs AGZ-XXXX-XXXX AGZ-YYYY-YYYY   # حذف أكواد محدّدة
 *   node scripts/clear-codes.mjs --all                          # حذف كل الأكواد (احذر!)
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

function loadEnv() {
  try {
    const txt = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of txt.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    /* لا ملف .env.local */
  }
}
loadEnv();

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("✗ متغيرات Supabase مفقودة في .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const args = process.argv.slice(2);
const all = args.includes("--all");
const codes = args.filter((a) => !a.startsWith("--"));

let query = supabase.from("access_codes").delete({ count: "exact" });
if (all) {
  query = query.neq("code", ""); // كل الصفوف
} else if (codes.length) {
  query = query.in("code", codes);
} else {
  console.error("مرّر أكواداً للحذف، أو --all لحذف الكل.");
  process.exit(1);
}

const { error, count } = await query;
if (error) {
  console.error("✗ فشل الحذف:", error.message);
  process.exit(1);
}
console.log(`✓ تم حذف ${count ?? 0} كود.`);
