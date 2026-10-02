"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, ApiError, type Disciplina, type TurmaDetalhe } from "@/lib/api";

interface TurmaCtx {
  detalhe: TurmaDetalhe;
  disciplinas: Disciplina[];
  souAdmin: boolean;
  recarregar: () => Promise<void>;
}

const Ctx = createContext<TurmaCtx | null>(null);

/** Carrega a turma + disciplinas uma vez e compartilha entre as abas. */
export function TurmaProvider({ turmaId, children }: { turmaId: string; children: React.ReactNode }) {
  const [detalhe, setDetalhe] = useState<TurmaDetalhe | null>(null);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [erro, setErro] = useState("");

  const recarregar = useCallback(async () => {
    try {
      const [d, disc] = await Promise.all([api.turma(turmaId), api.disciplinas(turmaId)]);
      setDetalhe(d);
      setDisciplinas(disc);
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Não foi possível carregar a turma.");
    }
  }, [turmaId]);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  if (erro) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <p className="font-semibold">{erro}</p>
        <Link href="/turmas" className="mt-2 inline-block text-sm font-semibold text-caneta hover:underline">
          Voltar para minhas turmas
        </Link>
      </main>
    );
  }
  if (!detalhe) return <main className="mx-auto max-w-4xl px-4 py-10 text-sm text-tinta-suave">Carregando…</main>;

  return (
    <Ctx.Provider value={{ detalhe, disciplinas, souAdmin: detalhe.turma.meuPapel === "ADMIN", recarregar }}>
      {children}
    </Ctx.Provider>
  );
}

export function useTurma() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useTurma precisa estar dentro de <TurmaProvider>");
  return c;
}
