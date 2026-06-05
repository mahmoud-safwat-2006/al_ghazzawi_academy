import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative size-9 shrink-0">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-royal-600 via-royal-700 to-navy" />
        <div className="absolute inset-0 flex items-center justify-center text-white font-black text-lg">
          غ
        </div>
        <div className="absolute -bottom-0.5 -end-0.5 size-2.5 rounded-full bg-cyan-brand ring-2 ring-background" />
      </div>
      <div className="flex flex-col leading-tight">
        <span className="font-bold text-foreground text-[15px]">
          أكاديمية الغزاوي
        </span>
        <span className="text-[10px] font-medium text-muted tracking-wider uppercase">
          MBA Academy
        </span>
      </div>
    </div>
  );
}
