import { useState } from "react";
import Icon from "./Icon";
import { ME, DUCK } from "@/data";
import { useReveal } from "@/hooks/useReveal";

export default function Profile() {
  const [i, setI] = useState(0);
  const [ref, shown] = useReveal();
  const s = ME.slides[i], n = ME.slides.length;
  return (
    <section ref={ref} id="sobre" className={`prof reveal${shown ? " in" : ""}`}>
      <h2>Sobre o criador</h2>
      <div className="stage">
        <div className="photo"><img src={DUCK} alt="Pato mascote de óculos" /></div>
        <div className="pcard" key={i}>
          <h3>{ME.name}</h3>
          <small>{s[0]} · {s[1]}</small>
          <p>{s[2]}</p>
          <div className="soc">
            {ME.links.map(([k, u]) => (
              <a key={k} href={u} target="_blank" rel="noreferrer" aria-label={k}><Icon n={k === "x" ? "x2" : k} /></a>
            ))}
          </div>
        </div>
      </div>
      <div className="nav">
        <button onClick={() => setI((i + n - 1) % n)} aria-label="Anterior"><Icon n="l" /></button>
        {ME.slides.map((_, k) => <button key={k} className={`dot${k === i ? " on" : ""}`} onClick={() => setI(k)} aria-label={`Slide ${k + 1}`} />)}
        <button onClick={() => setI((i + 1) % n)} aria-label="Próximo"><Icon n="r" /></button>
      </div>
    </section>
  );
}
