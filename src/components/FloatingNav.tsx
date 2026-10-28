import { useState, type MouseEvent } from "react";
import { Home, Library, Moon, ShoppingBag, Sun } from "lucide-react";
import { cn } from "@/lib/cn";
import { hrefOf, useNavHandler } from "@/lib/router";
import { useTheme } from "@/hooks/useTheme";

const ITEMS = [
  { id: "inicio", label: "Início", icon: Home, to: "/", kind: "route" },
  { id: "recursos", label: "Recursos", icon: Library, to: "#recursos", kind: "section" },
  { id: "prompts", label: "Prompts", icon: Library, to: "#textos", kind: "section" },
  { id: "produtos", label: "Produtos", icon: ShoppingBag, to: "/produtos", kind: "route" },
] as const;

/**
 * Floating bottom navigation. Active state is derived from the real path,
 * so it never claims you are somewhere you are not.
 */
export default function FloatingNav({ path }: { path: string }) {
  const onNav = useNavHandler();
  const { mode, toggle } = useTheme();
  const [hovered, setHovered] = useState<string | null>(null);
  const inPrompts = path === "/";
  const isProducts = path.startsWith("/produtos");

  const isActive = (id: string) => {
    if (id === "produtos") return isProducts;
    if (id === "inicio") return path === "/";
    return false;
  };

  return (
    <nav
      aria-label="Navegação principal"
      className="pointer-events-none fixed inset-x-0 bottom-[max(16px,env(safe-area-inset-bottom))] z-40 flex justify-center px-4"
    >
      <div
        className="pointer-events-auto flex items-center gap-1 rounded-full border border-hairline bg-surface/80 p-1.5 shadow-[var(--shadow-lift)] backdrop-blur-xl"
        onMouseLeave={() => setHovered(null)}
      >
        {ITEMS.map(({ id, label, icon: Icon, to }) => {
          const active = isActive(id);
          const show = id === "prompts" ? inPrompts && !isProducts : true;
          if (!show) return null;
          return (
            <a
              key={id}
              href={hrefOf(to)}
              onClick={(e: MouseEvent<HTMLAnchorElement>) => onNav(e, to)}
              onMouseEnter={() => setHovered(id)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex items-center gap-2 rounded-full px-3 py-2 text-[13px] font-medium transition-colors",
                active ? "bg-ink text-canvas" : "text-ink-2 hover:bg-surface-2 hover:text-ink",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span className={cn("hidden sm:inline", hovered === id && "inline")}>{label}</span>
            </a>
          );
        })}

        <span aria-hidden="true" className="mx-1 h-6 w-px bg-hairline" />

        <button
          type="button"
          onClick={toggle}
          aria-label={mode === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
          aria-pressed={mode === "dark"}
          className="ml-0.5 grid size-9 place-items-center rounded-full text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
        >
          {mode === "dark" ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}
        </button>
      </div>
    </nav>
  );
}
