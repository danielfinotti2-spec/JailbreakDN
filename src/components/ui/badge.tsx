import * as React from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "warm" | "danger" | "warn" | "accent";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-2 text-ink-2 border-transparent",
  warm: "bg-[var(--warm-soft)] text-[var(--warm)] border-transparent",
  danger: "bg-danger/10 text-danger border-danger/25",
  warn: "bg-[var(--warn)]/10 text-[var(--warn)] border-[var(--warn)]/25",
  accent: "bg-accent/10 text-accent border-accent/25",
};

export function Badge({
  className,
  tone = "neutral",
  ...props
}: React.ComponentProps<"span"> & { tone?: Tone }) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-tight",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
