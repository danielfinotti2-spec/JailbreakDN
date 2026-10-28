/* Link interno com navegação do app.

   Existe para que nenhum link interno dependa de `href="#"`: o href é
   sempre uma URL real (copiável, abrível em nova aba), e o clique
   normal é interceptado pelo router. Modificadores continuam
   funcionando porque o handler os respeita. */

import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import { useNavHandler } from "@/lib/router";

interface Props extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
}

export function Link({ href, children, onClick, ...rest }: Props) {
  const nav = useNavHandler();

  return (
    <a
      href={href}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(e);
        if (!e.defaultPrevented) nav(e, href);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
