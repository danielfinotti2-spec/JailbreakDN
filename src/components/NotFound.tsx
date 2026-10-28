import { ArrowLeft, Compass, Home } from "lucide-react";
import type { MouseEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "./ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "./ui/empty";
import { useNavHandler } from "@/lib/router";

/**
 * 404 page.
 *
 * The original reference markup used href="#" on both buttons, which goes
 * nowhere. Here both targets are real routes handled by the app router:
 * "/" is the home route defined in Root, and "/#recursos" is a live section
 * on it. Nothing redirects silently — the URL stays on the missing path so
 * the visitor can see and copy it.
 */
export default function NotFound({ path }: { path: string }) {
  const onNav = useNavHandler();
  const reduce = useReducedMotion();

  return (
    <main className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden px-5">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 45% at 50% 0%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 70%)",
        }}
      />
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-lg"
      >
        <Empty>
          <EmptyHeader>
            <EmptyTitle
              aria-hidden="true"
              className="text-[clamp(5rem,22vw,9rem)] font-extrabold leading-none tracking-[-0.05em]"
              style={{
                WebkitMaskImage: "linear-gradient(to bottom, #000 20%, transparent 85%)",
                maskImage: "linear-gradient(to bottom, #000 20%, transparent 85%)",
              }}
            >
              404
            </EmptyTitle>
            <EmptyDescription className="-mt-8">
              A página <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-ink">{path}</code>{" "}
              não existe ou foi movida.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex flex-wrap justify-center gap-2">
              <Button asChild>
                <a href="/" onClick={(e: MouseEvent<HTMLAnchorElement>) => onNav(e, "/")}>
                  <Home aria-hidden="true" />
                  Ir para o início
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="/#recursos" onClick={(e: MouseEvent<HTMLAnchorElement>) => onNav(e, "#recursos")}>
                  <Compass aria-hidden="true" />
                  Explorar recursos
                </a>
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="text-ink-3"
            >
              <ArrowLeft aria-hidden="true" />
              Voltar uma página
            </Button>
          </EmptyContent>
        </Empty>
      </motion.div>
    </main>
  );
}
