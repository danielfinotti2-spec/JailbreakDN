/* Ilustrações da seção "Como funciona".

   São SVG desenhados em código, não imagens de banco: pesam alguns kB,
   escalam sem borrar e usam os mesmos tokens de cor do site, então
   acompanham o tema claro/escuro sozinhos.

   Cada uma representa um passo concreto do uso — não são decoração
   genérica de "tecnologia" com formas abstratas. */

export function IlustracaoBuscar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 120" fill="none" className={className} aria-hidden="true">
      {/* Campo de busca */}
      <rect x="16" y="14" width="168" height="22" rx="4" stroke="currentColor" strokeOpacity="0.25" />
      <circle cx="29" cy="25" r="4.5" stroke="currentColor" strokeOpacity="0.4" />
      <path d="M32.5 28.5 L36 32" stroke="currentColor" strokeOpacity="0.4" strokeLinecap="round" />
      <rect x="41" y="21" width="52" height="3" rx="1.5" fill="currentColor" fillOpacity="0.5" />
      <rect x="41" y="27" width="30" height="2" rx="1" fill="currentColor" fillOpacity="0.15" />

      {/* Resultados */}
      {[46, 66, 86].map((y, i) => (
        <g key={y} opacity={1 - i * 0.22}>
          <rect x="16" y={y} width="168" height="16" rx="2" fill="currentColor" fillOpacity="0.04" />
          <rect x="22" y={y + 5} width={[64, 48, 56][i]} height="3" rx="1.5" fill="currentColor" fillOpacity="0.55" />
          <rect x="22" y={y + 10} width={[96, 78, 88][i]} height="2" rx="1" fill="currentColor" fillOpacity="0.18" />
          <rect x="166" y={y + 6} width="12" height="4" rx="2" fill="currentColor" fillOpacity="0.25" />
        </g>
      ))}
    </svg>
  );
}

export function IlustracaoCategorias({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 120" fill="none" className={className} aria-hidden="true">
      {/* Árvore: grupo aberto à esquerda, subcategorias empilhadas */}
      <rect x="16" y="12" width="80" height="14" rx="2" fill="currentColor" fillOpacity="0.55" />
      <path d="M20 19 h6 M23 16 v6" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.5" />
      {[36, 54, 72, 90].map((y, i) => (
        <g key={y}>
          <path d={`M24 ${y + 6} h8`} stroke="currentColor" strokeOpacity="0.2" />
          <rect x="36" y={y} width={[62, 50, 58, 44][i]} height="12" rx="2" fill="currentColor" fillOpacity="0.06" />
          <rect x="41" y={y + 4.5} width={[40, 30, 36, 24][i]} height="3" rx="1.5" fill="currentColor" fillOpacity="0.35" />
        </g>
      ))}

      {/* Painel do recurso selecionado */}
      <rect x="112" y="12" width="72" height="96" rx="4" stroke="currentColor" strokeOpacity="0.2" />
      <rect x="120" y="20" width="40" height="4" rx="2" fill="currentColor" fillOpacity="0.5" />
      <rect x="120" y="29" width="56" height="2" rx="1" fill="currentColor" fillOpacity="0.15" />
      <rect x="120" y="34" width="46" height="2" rx="1" fill="currentColor" fillOpacity="0.15" />
      <rect x="120" y="39" width="52" height="2" rx="1" fill="currentColor" fillOpacity="0.15" />
      <rect x="120" y="52" width="56" height="16" rx="2" fill="currentColor" fillOpacity="0.85" />
      <rect x="139" y="58" width="18" height="3" rx="1.5" fill="currentColor" fillOpacity="0.1" style={{ mixBlendMode: "difference" }} />
      <rect x="120" y="74" width="56" height="14" rx="2" stroke="currentColor" strokeOpacity="0.2" />
      <rect x="134" y="79.5" width="28" height="3" rx="1.5" fill="currentColor" fillOpacity="0.2" />
    </svg>
  );
}

export function IlustracaoSalvar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 120" fill="none" className={className} aria-hidden="true">
      {/* Linhas com o coração marcado em uma */}
      {[18, 38, 58, 78].map((y, i) => (
        <g key={y}>
          <rect x="16" y={y} width="168" height="14" rx="2" fill={i === 1 ? "currentColor" : "none"} fillOpacity="0.06" />
          <rect x="22" y={y + 4} width={[58, 44, 52, 48][i]} height="3" rx="1.5" fill="currentColor" fillOpacity="0.45" />
          <rect x="22" y={y + 9} width={[92, 74, 84, 70][i]} height="2" rx="1" fill="currentColor" fillOpacity="0.15" />
          {i === 1 ? (
            <path
              d="M172 20.5c-1.6-1.8-4.2-1.8-5.8 0-1.6-1.8-4.2-1.8-5.8 0-1.5 1.7-1.5 4.2 0 5.9l5.8 5.6 5.8-5.6c1.5-1.7 1.5-4.2 0-5.9z"
              fill="currentColor"
              fillOpacity="0.9"
            />
          ) : (
            <path
              d="M166 20c-1.2-1.3-3-1.3-4.2 0-1.2-1.3-3-1.3-4.2 0-1.1 1.2-1.1 3 0 4.2l4.2 4 4.2-4c1.1-1.2 1.1-3 0-4.2z"
              stroke="currentColor"
              strokeOpacity="0.25"
            />
          )}
        </g>
      ))}

      {/* Contador de favoritos */}
      <rect x="16" y="98" width="60" height="12" rx="6" fill="currentColor" fillOpacity="0.9" />
      <path
        d="M27 101.5c-.9-1-2.3-1-3.2 0-.9-1-2.3-1-3.2 0-.8 1-.8 2.3 0 3.2l3.2 3.1 3.2-3.1c.8-.9.8-2.2 0-3.2z"
        fill="currentColor"
        fillOpacity="0.08"
        style={{ mixBlendMode: "difference" }}
      />
      <rect x="35" y="102.5" width="34" height="3" rx="1.5" fill="currentColor" fillOpacity="0.08" style={{ mixBlendMode: "difference" }} />
    </svg>
  );
}
