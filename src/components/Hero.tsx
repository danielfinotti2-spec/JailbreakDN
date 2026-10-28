import { lazy, Suspense, type MouseEvent } from "react";
import { Link2 } from "lucide-react";
import { Button } from "./ui/button";
import { useNavHandler } from "@/lib/router";
import { motion, useReducedMotion } from "motion/react";
import { RESOURCES } from "@/data/links";

// The 3D scene is heavy; it loads after the page shell is interactive.
const DuckScene = lazy(() => import("@/scenes/DuckScene"));

export default function Hero() {
  const onNav = useNavHandler();
  const reduce = useReducedMotion();

  return (
    <section id="inicio" className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-5 pb-12 pt-20 md:grid-cols-[1.05fr_0.95fr] md:gap-8 md:pt-28">
      <div>
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 18, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-[clamp(2.4rem,6.4vw,4.6rem)] font-semibold leading-[0.98] tracking-[-0.035em] text-ink"
        >
          Cofre de TXT
        </motion.h1>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="mt-5 max-w-[46ch] text-[clamp(1rem,1.6vw,1.15rem)] leading-relaxed text-ink-2"
        >
          Prompts, personas e uma biblioteca organizada de recursos externos — com aviso de risco
          em cada link que merece um.
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 flex flex-wrap gap-3"
        >
          <Button asChild size="lg">
            <a href="/#recursos" onClick={(e: MouseEvent<HTMLAnchorElement>) => onNav(e, "#recursos")}>
              <Link2 aria-hidden="true" />
              Ver recursos
            </a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href="/#textos" onClick={(e: MouseEvent<HTMLAnchorElement>) => onNav(e, "#textos")}>
              Biblioteca de prompts
            </a>
          </Button>
        </motion.div>

        <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-hairline pt-6">
          <div>
            <dt className="text-xs text-ink-3">Recursos</dt>
            <dd className="text-xl font-semibold tabular-nums text-ink">{RESOURCES.length}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-3">Categorias</dt>
            <dd className="text-xl font-semibold tabular-nums text-ink">5</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-3">Com fonte aberta</dt>
            <dd className="text-xl font-semibold tabular-nums text-ink">100%</dd>
          </div>
        </dl>
      </div>

      <div className="relative order-first h-[320px] w-full md:order-none md:h-[480px]">
        <Suspense
          fallback={
            <div className="grid h-full place-items-center">
              <img src="/duck.webp" alt="Mascote" className="w-48 opacity-70" />
            </div>
          }
        >
          <DuckScene className="h-full w-full" />
        </Suspense>
      </div>
    </section>
  );
}
