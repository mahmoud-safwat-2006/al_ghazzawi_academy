/**
 * Build a mind-map tree from a chapter's detailed summary HTML.
 *
 * Extracts the H3 sections as branches, each with their H4 sub-sections and
 * list items as leaves. No DOM parser dependency — uses regex over the same
 * trusted content we ship in src/content/.
 */

export interface MindNode {
  /** display text */
  label: string;
  children: MindNode[];
}

/** Strip tags and decode entities — minimal subset since input is trusted. */
function stripTags(s: string): string {
  return s
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/** Truncate label to keep nodes visually compact. */
function compact(text: string, max = 80): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trim() + "…";
}

/**
 * Parse the chapter's detailed summary HTML into a tree:
 *   root → h3 sections → (h4 sub-sections OR top-level li items)
 *
 * The structure mirrors the headings we authored in src/content/hr/*.
 */
export function buildMindMap(rootLabel: string, html: string): MindNode {
  const root: MindNode = { label: rootLabel, children: [] };
  if (!html) return root;

  // Match each h3 + everything until next h3 (or end)
  const sectionRe = /<h3[^>]*>([\s\S]*?)<\/h3>([\s\S]*?)(?=<h3|$)/gi;
  let m: RegExpExecArray | null;

  while ((m = sectionRe.exec(html)) !== null) {
    const h3Text = compact(stripTags(m[1]));
    const body = m[2];
    if (!h3Text) continue;

    const section: MindNode = { label: h3Text, children: [] };

    // Look for h4 sub-sections inside this h3 block
    const h4Re = /<h4[^>]*>([\s\S]*?)<\/h4>/gi;
    let h4Match: RegExpExecArray | null;
    while ((h4Match = h4Re.exec(body)) !== null) {
      const h4Text = compact(stripTags(h4Match[1]), 60);
      if (h4Text) section.children.push({ label: h4Text, children: [] });
    }

    // If no h4, fall back to the first <ul> or <ol> as branches
    if (section.children.length === 0) {
      const listRe = /<(ul|ol)[^>]*>([\s\S]*?)<\/\1>/i;
      const list = listRe.exec(body);
      if (list) {
        const itemRe = /<li[^>]*>([\s\S]*?)<\/li>/gi;
        let li: RegExpExecArray | null;
        let count = 0;
        while ((li = itemRe.exec(list[2])) !== null && count < 6) {
          const text = compact(stripTags(li[1]), 70);
          if (text) {
            section.children.push({ label: text, children: [] });
            count += 1;
          }
        }
      }
    }

    root.children.push(section);
  }

  return root;
}
