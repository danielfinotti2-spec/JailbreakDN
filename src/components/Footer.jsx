import Icon from "./Icon";
import { ME } from "@/data";

export default function Footer() {
  return (
    <footer className="foot">
      <div className="foot-bot">
        <span>© {new Date().getFullYear()} {ME.name}</span>
        <div className="soc">
          {ME.links.map(([k, u]) => (
            <a key={k} href={u} target="_blank" rel="noreferrer" aria-label={k}><Icon n={k === "x" ? "x2" : k} s={16} /></a>
          ))}
        </div>
      </div>
    </footer>
  );
}
