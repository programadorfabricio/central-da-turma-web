"use client";

import { useState } from "react";
import { api, ApiError, type Atividade, type Status, type Tipo } from "@/lib/api";
import { blocoData, quandoVence, venceLogo } from "@/lib/datas";

export const ROTULO_TIPO: Record<Tipo, string> = {
  ATIVIDADE: "Atividade",
  PROVA: "Prova",
  TRABALHO: "Trabalho",
  ENTREGA: "Entrega",
};

export const ROTULO_STATUS: Record<Status, string> = {
  PENDENTE: "A fazer",
  EM_ANDAMENTO: "Fazendo",
  CONCLUIDA: "Feita",
};

/**
 * Uma linha da agenda. A data fica num bloco à esquerda, como numa agenda escolar:
 * marca-texto amarelo quando vence em até 2 dias, sublinhado vermelho quando atrasou.
 */
export function AtividadeItem({
  atividade,
  aoAtualizar,
  aoEditar,
}: {
  atividade: Atividade;
  aoAtualizar: (a: Atividade) => void;
  aoEditar?: (a: Atividade) => void;
}) {
  const [erro, setErro] = useState("");
  const [avisando, setAvisando] = useState(false);
  const d = blocoData(atividade.prazo);
  const feita = atividade.meuStatus === "CONCLUIDA";
  const logo = !feita && venceLogo(atividade.prazo);

  async function mudarStatus(s: Status) {
    if (s === atividade.meuStatus) return;
    setErro("");
    const anterior = atividade;
    aoAtualizar({ ...atividade, meuStatus: s, atrasada: s !== "CONCLUIDA" && new Date(atividade.prazo) < new Date() });
    try {
      aoAtualizar(await api.alterarStatus(atividade.id, s));
    } catch (e) {
      aoAtualizar(anterior);
      setErro(e instanceof ApiError ? e.message : "Não foi possível salvar.");
    }
  }

  async function avisarTurma() {
    setErro("");
    setAvisando(true);
    // Abre a aba antes do await para o navegador não bloquear como pop-up.
    const janela = window.open("", "_blank");
    try {
      const { whatsappUrl } = await api.aviso(atividade.id);
      if (janela) janela.location.href = whatsappUrl;
      else window.location.href = whatsappUrl;
    } catch (e) {
      janela?.close();
      setErro(e instanceof ApiError ? e.message : "Não foi possível gerar o aviso.");
    } finally {
      setAvisando(false);
    }
  }

  return (
    <li className={`flex gap-4 px-4 py-4 sm:px-5 ${feita ? "opacity-60" : ""}`}>
      <div className="w-14 shrink-0 text-center" aria-hidden="true">
        <p className="text-xs font-semibold capitalize text-tinta-suave">{d.semana}</p>
        <p
          className={`text-[28px] font-semibold leading-tight tabular-nums ${logo ? "marca-texto" : ""} ${
            atividade.atrasada ? "risco-vermelho text-correcao" : ""
          }`}
        >
          {d.dia}
        </p>
        <p className="text-xs capitalize text-tinta-suave">{d.mes}</p>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-tinta-suave">
          {atividade.disciplina && (
            <span className="inline-flex items-center gap-1.5">
              <span
                className="size-2.5 rounded-full"
                style={{ background: atividade.disciplina.cor ?? "var(--color-tinta-suave)" }}
              />
              {atividade.disciplina.nome}
            </span>
          )}
          <span className="rounded border border-linha px-1.5 text-xs font-semibold">{ROTULO_TIPO[atividade.tipo]}</span>
        </div>

        <h3 className={`mt-1 font-semibold leading-snug ${feita ? "line-through decoration-visto decoration-2" : ""}`}>
          {atividade.titulo}
        </h3>
        <p className={`mt-0.5 text-sm ${atividade.atrasada ? "font-semibold text-correcao" : "text-tinta-suave"}`}>
          {feita ? "Você já fez esta" : quandoVence(atividade.prazo)}
        </p>
        {atividade.descricao && <p className="mt-2 line-clamp-2 text-sm text-tinta-suave">{atividade.descricao}</p>}

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          <SeletorStatus valor={atividade.meuStatus} aoMudar={mudarStatus} titulo={atividade.titulo} />
          {atividade.link && (
            <a
              href={atividade.link}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-caneta hover:underline"
            >
              Abrir no AVA
            </a>
          )}
          <button
            onClick={avisarTurma}
            disabled={avisando}
            className="text-sm font-semibold text-visto hover:underline disabled:opacity-60"
          >
            {avisando ? "Gerando aviso…" : "Avisar a turma"}
          </button>
          {atividade.podeEditar && aoEditar && (
            <button onClick={() => aoEditar(atividade)} className="text-sm font-semibold text-tinta-suave hover:text-tinta">
              Editar
            </button>
          )}
        </div>
        {erro && (
          <p role="alert" className="mt-2 text-sm text-correcao">
            {erro}
          </p>
        )}
      </div>
    </li>
  );
}

function SeletorStatus({ valor, aoMudar, titulo }: { valor: Status; aoMudar: (s: Status) => void; titulo: string }) {
  const opcoes: Status[] = ["PENDENTE", "EM_ANDAMENTO", "CONCLUIDA"];
  const cor: Record<Status, string> = {
    PENDENTE: "bg-tinta text-white",
    EM_ANDAMENTO: "bg-caneta text-white",
    CONCLUIDA: "bg-visto text-white",
  };
  return (
    <div role="radiogroup" aria-label={`Meu status em ${titulo}`} className="inline-flex rounded-md border border-linha p-0.5">
      {opcoes.map((s) => (
        <button
          key={s}
          role="radio"
          aria-checked={valor === s}
          onClick={() => aoMudar(s)}
          className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
            valor === s ? cor[s] : "text-tinta-suave hover:text-tinta"
          }`}
        >
          {ROTULO_STATUS[s]}
        </button>
      ))}
    </div>
  );
}
