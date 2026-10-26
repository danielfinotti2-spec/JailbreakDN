import Icon from "./Icon";

export default function Reactions({ it, onOpen, onUse, onSend }) {
  return (
    <div className="react">
      <button onClick={onOpen} aria-label="Abrir"><Icon n="chat" />{it.views}</button>
      <button onClick={onUse} aria-label="Copiar"><Icon n="rep" />{it.uses}</button>
      <button onClick={onSend} aria-label="Baixar .txt"><Icon n="send" /></button>
    </div>
  );
}
