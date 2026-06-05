"use client";

import { useState } from "react";
import { ChevronDown, ChevronLeft, Network } from "lucide-react";
import type { MindNode } from "@/lib/mindmap";

interface Props {
  root: MindNode;
}

/** Color rotation for branches — keeps the map visually scannable. */
const BRANCH_COLORS = [
  { bg: "bg-cyan-50", border: "border-cyan-300", text: "text-cyan-900", dot: "bg-cyan-500" },
  { bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-900", dot: "bg-amber-500" },
  { bg: "bg-emerald-50", border: "border-emerald-300", text: "text-emerald-900", dot: "bg-emerald-500" },
  { bg: "bg-violet-50", border: "border-violet-300", text: "text-violet-900", dot: "bg-violet-500" },
  { bg: "bg-rose-50", border: "border-rose-300", text: "text-rose-900", dot: "bg-rose-500" },
  { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-900", dot: "bg-blue-500" },
];

export function MindMapView({ root }: Props) {
  if (root.children.length === 0) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-8 text-center text-muted">
        لا يمكن بناء خريطة ذهنية لهذا الفصل
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Center node */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-royal-600 to-cyan-600 text-white px-6 py-4 shadow-card">
          <Network className="size-5" />
          <span className="font-black text-base sm:text-lg">{root.label}</span>
        </div>
      </div>

      {/* Vertical connector */}
      <div className="flex justify-center">
        <div className="w-px h-6 bg-border" />
      </div>

      {/* Branches */}
      <div className="grid sm:grid-cols-2 gap-4">
        {root.children.map((branch, i) => (
          <Branch
            key={`${branch.label}-${i}`}
            node={branch}
            color={BRANCH_COLORS[i % BRANCH_COLORS.length]}
          />
        ))}
      </div>
    </div>
  );
}

interface BranchProps {
  node: MindNode;
  color: typeof BRANCH_COLORS[number];
}

function Branch({ node, color }: BranchProps) {
  const [open, setOpen] = useState(true);
  const hasChildren = node.children.length > 0;

  return (
    <div className={`rounded-2xl border-2 ${color.border} ${color.bg} p-4`}>
      <button
        onClick={() => hasChildren && setOpen(!open)}
        className={`w-full text-start flex items-start gap-2 ${
          hasChildren ? "cursor-pointer" : "cursor-default"
        }`}
      >
        <span className={`mt-1.5 size-2 rounded-full ${color.dot} shrink-0`} />
        <span className={`flex-1 text-sm font-bold ${color.text} leading-relaxed`}>
          {node.label}
        </span>
        {hasChildren && (
          <span className={color.text + " shrink-0 mt-0.5"}>
            {open ? <ChevronDown className="size-4" /> : <ChevronLeft className="size-4" />}
          </span>
        )}
      </button>

      {hasChildren && open && (
        <ul className="mt-3 space-y-1.5 pr-4 border-r-2 border-dashed border-border/60">
          {node.children.map((leaf, i) => (
            <li key={`${leaf.label}-${i}`} className="flex items-start gap-2">
              <span className="mt-1.5 -mr-[5px] size-1.5 rounded-full bg-foreground/40 shrink-0" />
              <span className="text-xs text-foreground/80 leading-relaxed">
                {leaf.label}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
