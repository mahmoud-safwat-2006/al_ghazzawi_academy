/**
 * Tiny Markdown renderer for the notes editor — handles the subset we need
 * without pulling in a full parser. Escapes HTML to prevent XSS.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function inline(s: string): string {
  // Order matters: process code first so other rules don't touch its content
  return s
    .replace(/`([^`]+)`/g, (_, code) => `<code class="px-1 py-0.5 rounded bg-border/50 text-xs">${escapeHtml(code)}</code>`)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[\s(])\*([^*\n]+)\*/g, "$1<em>$2</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-cyan-700 underline" target="_blank" rel="noopener">$1</a>');
}

export function renderMarkdown(src: string): string {
  if (!src.trim()) return "";

  const lines = escapeHtml(src).split("\n");
  const out: string[] = [];
  let inUl = false;
  let inOl = false;
  let inCode = false;
  let inPara: string[] = [];

  const flushPara = () => {
    if (inPara.length > 0) {
      out.push(`<p>${inline(inPara.join(" "))}</p>`);
      inPara = [];
    }
  };
  const closeLists = () => {
    if (inUl) {
      out.push("</ul>");
      inUl = false;
    }
    if (inOl) {
      out.push("</ol>");
      inOl = false;
    }
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, "");

    if (line.trim().startsWith("```")) {
      flushPara();
      closeLists();
      if (inCode) {
        out.push("</code></pre>");
        inCode = false;
      } else {
        out.push('<pre class="rounded-lg bg-border/30 p-3 my-2 overflow-x-auto text-xs"><code>');
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      out.push(raw + "\n");
      continue;
    }

    if (!line.trim()) {
      flushPara();
      closeLists();
      continue;
    }

    // Headings
    const h = /^(#{1,3})\s+(.+)$/.exec(line);
    if (h) {
      flushPara();
      closeLists();
      const level = h[1].length;
      const cls =
        level === 1
          ? "text-xl font-black mt-4 mb-2"
          : level === 2
          ? "text-lg font-bold mt-3 mb-1.5"
          : "text-base font-bold mt-2 mb-1";
      out.push(`<h${level} class="${cls}">${inline(h[2])}</h${level}>`);
      continue;
    }

    // Unordered list
    const u = /^[-*]\s+(.+)$/.exec(line);
    if (u) {
      flushPara();
      if (inOl) {
        out.push("</ol>");
        inOl = false;
      }
      if (!inUl) {
        out.push('<ul class="list-disc pr-5 my-2 space-y-1">');
        inUl = true;
      }
      out.push(`<li>${inline(u[1])}</li>`);
      continue;
    }

    // Ordered list
    const o = /^\d+\.\s+(.+)$/.exec(line);
    if (o) {
      flushPara();
      if (inUl) {
        out.push("</ul>");
        inUl = false;
      }
      if (!inOl) {
        out.push('<ol class="list-decimal pr-5 my-2 space-y-1">');
        inOl = true;
      }
      out.push(`<li>${inline(o[1])}</li>`);
      continue;
    }

    // Blockquote — note: > has already been escaped to &gt;
    const q = /^&gt;\s+(.+)$/.exec(line);
    if (q) {
      flushPara();
      closeLists();
      out.push(`<blockquote class="border-r-4 border-cyan-400 pr-3 my-2 italic text-muted">${inline(q[1])}</blockquote>`);
      continue;
    }

    // Plain paragraph line
    closeLists();
    inPara.push(line);
  }

  flushPara();
  closeLists();
  if (inCode) out.push("</code></pre>");

  return out.join("");
}
