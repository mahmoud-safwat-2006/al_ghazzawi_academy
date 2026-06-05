-- ============================================================================
-- أكاديمية الغزاوي — الدفتر المركزي لأكواد التفعيل (المرحلة 2)
-- ============================================================================
-- كيفية الاستخدام:
--   1) افتح مشروعك على Supabase → SQL Editor → New query
--   2) الصق كامل هذا الملف واضغط Run
--   3) خُذ من Project Settings → API:  Project URL  و  service_role key
--      وضعهما في ملف .env.local (انظر .env.example)
-- ============================================================================

-- جدول الأكواد ----------------------------------------------------------------
create table if not exists public.access_codes (
  code         text primary key,                 -- الكود الفريد مثل AGZ-7K2P-9F4Q
  assigned_to  text,                              -- اسم الطالب (يُضبط عند أول تفعيل)
  max_devices  int  not null default 2,           -- الحدّ الأقصى لعدد الأجهزة (تتحكّم به)
  devices      jsonb not null default '[]'::jsonb,-- الأجهزة المسجّلة [{id, at}]
  used_at      timestamptz,                       -- وقت أول تفعيل
  created_at   timestamptz not null default now(),
  note         text                               -- ملاحظتك (اسم/بريد المشتري)
);

-- تفعيل RLS بلا أي policy: يمنع كل وصول عام (anon/authenticated) للجدول.
-- الوصول يتمّ حصراً عبر دالة claim_code المُناداة من الخادم بمفتاح service_role.
alter table public.access_codes enable row level security;

-- الدالة الذرّية للمطالبة بالكود ----------------------------------------------
-- تتحقق من: وجود الكود، تطابق الاسم (لشخص واحد)، حدّ الأجهزة. وتسجّل الجهاز.
-- ترجع jsonb: { ok: boolean, reason: 'ok'|'invalid'|'used_by_other'|'device_limit' }
create or replace function public.claim_code(
  p_code   text,
  p_name   text,
  p_device text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  rec        public.access_codes;
  dev_ids    text[];
  dev_count  int;
begin
  -- اقفل الصف لمنع تفعيلين متزامنين على نفس الكود (ذرّية).
  select * into rec from public.access_codes
    where code = upper(trim(p_code))
    for update;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;

  -- تطابق الاسم: أول تفعيل يضبطه؛ بعدها يجب أن يطابق (يمنع شخصاً آخر).
  if rec.assigned_to is not null
     and lower(trim(rec.assigned_to)) <> lower(trim(p_name)) then
    return jsonb_build_object('ok', false, 'reason', 'used_by_other');
  end if;

  -- معرّفات الأجهزة المسجّلة حالياً.
  select coalesce(array_agg(d->>'id'), array[]::text[])
    into dev_ids
    from jsonb_array_elements(rec.devices) as d;

  -- جهاز معروف؟ مقبول (إعادة دخول عادية).
  if p_device = any(dev_ids) then
    update public.access_codes
      set assigned_to = coalesce(assigned_to, trim(p_name))
      where code = rec.code;
    return jsonb_build_object('ok', true, 'reason', 'ok');
  end if;

  -- جهاز جديد: تحقّق من الحدّ.
  dev_count := coalesce(array_length(dev_ids, 1), 0);
  if dev_count >= rec.max_devices then
    return jsonb_build_object('ok', false, 'reason', 'device_limit');
  end if;

  -- سجّل الجهاز الجديد + اضبط الاسم/الوقت عند أول تفعيل.
  update public.access_codes
    set devices     = rec.devices || jsonb_build_object('id', p_device, 'at', now()),
        assigned_to = coalesce(assigned_to, trim(p_name)),
        used_at     = coalesce(used_at, now())
    where code = rec.code;

  return jsonb_build_object('ok', true, 'reason', 'ok');
end;
$$;

-- لا تسمح لأحد بمناداة الدالة مباشرة سوى الخادم (service_role).
revoke all on function public.claim_code(text, text, text) from public, anon, authenticated;
grant execute on function public.claim_code(text, text, text) to service_role;

-- صلاحية service_role على الجدول (للإدراج/القراءة من السكربت والخادم).
-- لازمة لأن "expose new tables" مُعطّل، فلا تُمنح الجداول الجديدة تلقائياً.
grant all on table public.access_codes to service_role;
