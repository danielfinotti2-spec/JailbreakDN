import { MessageCircle } from "lucide-react";
import { CREATOR, FOOTER_DATA } from "@/data/library";
import type { MouseEvent } from "react";
import { useNavHandler } from "@/lib/router";

/* lucide v1 removed brand icons, so social links use a neutral glyph
   plus the network name — clearer for screen readers anyway. */
const LABEL: Record<string, string> = {
  github: "GitHub",
  x: "X",
  ig: "Instagram",
};

export default function Footer() {
  const onNav = useNavHandler();
  return (
    <footer className="border-t border-hairline px-5 pb-28 pt-10">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-6">
        <div>
          <p className="text-sm font-semibold text-ink">{CREATOR.name}</p>
          <p className="mt-1 max-w-md text-xs leading-relaxed text-ink-3">{FOOTER_DATA.text}</p>
        </div>

        <nav aria-label="Rodapé" className="flex flex-wrap gap-4">
          {FOOTER_DATA.nav.map(([label, to]) => (
            <a
              key={label}
              href={to.startsWith("#") ? `/${to}` : to}
              onClick={(e: MouseEvent<HTMLAnchorElement>) => onNav(e, to)}
              className="text-xs font-medium text-ink-2 transition-colors hover:text-ink"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {CREATOR.links.map(([key, url]) => (
            <a
              key={key}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={LABEL[key] ?? key}
              title={LABEL[key] ?? key}
              className="grid size-9 place-items-center rounded-full border border-hairline text-ink-2 transition-colors hover:border-ink/25 hover:text-ink"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
      <p className="mx-auto mt-8 w-full max-w-6xl text-[11px] text-ink-3">
        © {new Date().getFullYear()} {CREATOR.name}. Conteúdo de terceiros pertence aos respectivos
        autores.
      </p>
    </footer>
  );
}

