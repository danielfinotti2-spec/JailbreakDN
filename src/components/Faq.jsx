import { useState } from "react";
import Icon from "./Icon";
import { FAQ } from "@/data";
import { useReveal } from "@/hooks/useReveal";

export default function Faq() {
  const [open, setOpen] = useState(1);
  const [ref, shown] = useReveal();
  return (
    <section ref={ref} id="faq" className={`faq reveal${shown ? " in" : ""}`}>
      <p className="faq-kicker">FAQ</p>
      <h2>Perguntas frequentes</h2>
      <p className="faq-sub">Reunimos as respostas para as dúvidas mais comuns sobre o Cofre de TXT.</p>
      <div className="faq-list">
        {FAQ.map(([q, a], i) => {
          const o = open === i;
          return (
            <div key={q} className={`faq-item${o ? " open" : ""}`}>
              <h3>
                <button id={`faq-b${i}`} aria-expanded={o} aria-controls={`faq-p${i}`} onClick={() => setOpen(o ? -1 : i)}>
                  {q}<Icon n="chev" s={20} />
                </button>
              </h3>
              <div className="faq-panel" id={`faq-p${i}`} role="region" aria-labelledby={`faq-b${i}`}><div><p>{a}</p></div></div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
