"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";

/** Barra do topo: marca à esquerda, usuário e "Sair" à direita. */
export function Topo({ children }: { children?: React.ReactNode }) {
  const { usuario, sair } = useAuth();
  return (
    <header className="border-b border-linha bg-folha">
      <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
        <Link href="/turmas" className="flex items-center gap-2 font-semibold tracking-tight">
          <Logo />
          <span className="hidden sm:inline">Central da Turma</span>
        </Link>
        <div className="min-w-0 flex-1">{children}</div>
        {usuario && (
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-tinta-suave md:inline">{usuario.nome.split(" ")[0]}</span>
            <button onClick={sair} className="font-semibold text-caneta hover:underline">
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

/** Marca: uma folha de caderno com a margem vermelha e um traço de marca-texto. */
export function Logo({ tamanho = 28 }: { tamanho?: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 32 32" aria-hidden="true">
      <rect x="4" y="3" width="24" height="26" rx="3" fill="#fff" stroke="#17233b" strokeWidth="2" />
      <line x1="10" y1="3" x2="10" y2="29" stroke="#c8372d" strokeWidth="1.5" />
      <rect x="12.5" y="9" width="12" height="5" rx="1" fill="#ffe14d" />
      <line x1="13" y1="12" x2="24" y2="12" stroke="#17233b" strokeWidth="2" strokeLinecap="round" />
      <line x1="13" y1="18" x2="24" y2="18" stroke="#2b59c3" strokeWidth="2" strokeLinecap="round" />
      <line x1="13" y1="23" x2="20" y2="23" stroke="#2b59c3" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
