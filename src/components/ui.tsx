"use client";

import { forwardRef, useEffect, useRef } from "react";

type BotaoVariante = "principal" | "secundario" | "fantasma" | "perigo";

const estilosBotao: Record<BotaoVariante, string> = {
  principal: "bg-caneta text-white hover:bg-caneta-escura",
  secundario: "bg-folha text-tinta border border-linha hover:border-tinta-suave",
  fantasma: "text-caneta hover:bg-caneta/8",
  perigo: "text-correcao hover:bg-correcao/8",
};

export function Botao({
  variante = "principal",
  carregando,
  className = "",
  children,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variante?: BotaoVariante; carregando?: boolean }) {
  return (
    <button
      {...props}
      disabled={disabled || carregando}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-55 ${estilosBotao[variante]} ${className}`}
    >
      {carregando ? "Aguarde…" : children}
    </button>
  );
}

const estiloCampo =
  "w-full rounded-md border border-linha bg-folha px-3 py-2 text-[15px] text-tinta placeholder:text-tinta-suave/70 focus:border-caneta focus:outline-none focus:ring-2 focus:ring-caneta/20 aria-[invalid=true]:border-correcao";

export const Entrada = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Entrada({ className = "", ...props }, ref) {
    return <input ref={ref} {...props} className={`${estiloCampo} ${className}`} />;
  },
);

export function AreaTexto({ className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${estiloCampo} min-h-24 ${className}`} />;
}

export function Selecao({ className = "", ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${estiloCampo} ${className}`} />;
}

export function Campo({
  rotulo,
  erro,
  dica,
  children,
}: {
  rotulo: string;
  erro?: string;
  dica?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{rotulo}</span>
      {children}
      {erro ? (
        <span className="mt-1 block text-sm text-correcao">{erro}</span>
      ) : dica ? (
        <span className="mt-1 block text-sm text-tinta-suave">{dica}</span>
      ) : null}
    </label>
  );
}

export function Aviso({ children, tipo = "erro" }: { children: React.ReactNode; tipo?: "erro" | "ok" }) {
  if (!children) return null;
  const cor = tipo === "erro" ? "border-correcao/40 bg-correcao/6 text-correcao" : "border-visto/40 bg-visto/8 text-visto";
  return (
    <p role={tipo === "erro" ? "alert" : "status"} className={`rounded-md border px-3 py-2 text-sm ${cor}`}>
      {children}
    </p>
  );
}

export function Carregando({ texto = "Carregando…" }: { texto?: string }) {
  return <p className="py-10 text-sm text-tinta-suave">{texto}</p>;
}

/** Janela modal usando <dialog> nativo (Esc fecha, foco fica preso dentro). */
export function Modal({
  aberto,
  aoFechar,
  titulo,
  children,
}: {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (aberto && !d.open) d.showModal();
    if (!aberto && d.open) d.close();
  }, [aberto]);

  return (
    <dialog
      ref={ref}
      onClose={aoFechar}
      onClick={(e) => {
        if (e.target === ref.current) aoFechar();
      }}
      className="m-auto w-[min(560px,calc(100vw-2rem))] rounded-lg bg-folha p-0 text-tinta shadow-2xl"
    >
      <div className="flex items-center justify-between border-b border-linha px-5 py-4">
        <h2 className="text-lg font-semibold">{titulo}</h2>
        <button
          type="button"
          onClick={aoFechar}
          aria-label="Fechar"
          className="rounded-md px-2 py-1 text-xl leading-none text-tinta-suave hover:bg-papel"
        >
          ×
        </button>
      </div>
      <div className="px-5 py-5">{aberto ? children : null}</div>
    </dialog>
  );
}

export function erroDeCampo(campos: Record<string, string>, nome: string) {
  return campos[nome];
}
