import * as React from "react";
import { cn } from "@/lib/cn";

/* shadcn/ui Empty primitives — the 404 page is built on these. */

export function Empty({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty"
      className={cn(
        "flex w-full flex-col items-center justify-center gap-6 text-center",
        className,
      )}
      {...props}
    />
  );
}

export function EmptyHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-header"
      className={cn("flex max-w-2xl flex-col items-center gap-3", className)}
      {...props}
    />
  );
}

export function EmptyTitle({ className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1
      data-slot="empty-title"
      className={cn("font-display font-semibold tracking-tight text-ink", className)}
      {...props}
    />
  );
}

export function EmptyDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="empty-description"
      className={cn("text-sm leading-relaxed text-ink-2", className)}
      {...props}
    />
  );
}

export function EmptyContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-content"
      className={cn("flex flex-col items-center gap-4", className)}
      {...props}
    />
  );
}
