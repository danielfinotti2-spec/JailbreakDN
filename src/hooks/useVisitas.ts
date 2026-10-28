/* Contador de visitantes — número público, não inventado.

    O acervo do rodapé só mostra números reais; seguir essa regra
    num contador de visitas exige uma fonte compartilhada. Três
    tentativas, nesta ordem, todas só-leitura+1:

    1. api.counterapi.dev — contador comunitário sem chave nem CORS
       fechado; devolve { count } a cada "up";
    2. api.countapi.xyz — o clássico; devolve { value };
    3. localStorage — se os dois serviços caírem, cada visitante
       conta pelo menos a si mesmo (número local, honesto pra má
       conexão).

    A PROMISE É SINGLETON no módulo: rodapé e masthead chamam o hook
    na mesma página, e sem isso cada instância somaria +1 — visita
    contada duas vezes pelo dono. Com o singleton, toda carga de
    página soma exatamente uma visita, não importa quantos
    componentes perguntem. StrictMode de dev idem. */

import { useEffect, useRef, useState } from "react";

const NAMESPACE = "jailbreakdn";
const CHAVE = "visitas";
const CHAVE_LOCAL = "jbdn:visitas";

let promessa: Promise<number | null> | null = null;

async function tentarCadeia(): Promise<number | null> {
  try {
    const r = await fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/${CHAVE}/up`);
    if (r.ok) {
      const j = await r.json();
      if (typeof j?.count === "number") return j.count;
    }
  } catch {
    /* rede sem serviço 1: cai pro próximo */
  }
  try {
    const r = await fetch(`https://api.countapi.xyz/hit/${NAMESPACE}/${CHAVE}`);
    if (r.ok) {
      const j = await r.json();
      if (typeof j?.value === "number") return j.value;
    }
  } catch {
    /* rede sem serviço 2: cai pro local */
  }
  try {
    const n = Number(localStorage.getItem(CHAVE_LOCAL) ?? "0") + 1;
    localStorage.setItem(CHAVE_LOCAL, String(n));
    return n;
  } catch {
    return null;
  }
}

function obterVisitas(): Promise<number | null> {
  if (!promessa) promessa = tentarCadeia();
  return promessa;
}

export function useVisitas(): number | null {
  const [visitas, setVisitas] = useState<number | null>(null);
  const rodou = useRef(false);

  useEffect(() => {
    if (rodou.current) return;
    rodou.current = true;
    let vivo = true;
    obterVisitas().then((n) => {
      if (vivo && n !== null) setVisitas(n);
    });
    return () => {
      vivo = false;
    };
  }, []);

  return visitas;
}
