"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api, ApiError, type Atividade } from "@/lib/api";
import { useTurma } from "@/components/TurmaContexto";
import { AtividadeItem } from "@/components/AtividadeItem";
import { AtividadeForm } from "@/components/AtividadeForm";
import { Aviso, Botao, Carregando, Modal, Selecao } from "@/components/ui";

type Filtro = "abertas" | "feitas" | "todas";

const FILTROS: { valor: Filtro; nome: string }[] = [
  { valor: "abertas", nome: "Abertas" },
  { valor: "feitas", nome: "Feitas" },
  { valor: "todas", nome: "Todas" },
];

export default function AtividadesPage() {
  const { detalhe, disciplinas } = useTurma();
  const turmaId = detalhe.turma.id;
  const [lista, setLista] = useState<Atividade[] | null>(null);
  const [erro, setErro] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("abertas");
  const [disciplinaId, setDisciplinaId] = useState("");
  const [nova, setNova] = useState(false);
  const [editando, setEditando] = useState<Atividade | null>(null);

  const carregar = useCallback(() => {
    api
      .atividades(turmaId)
      .then(setLista)
      .catch((e: ApiError) => setErro(e.message));
  }, [turmaId]);

  useEffect(carregar, [carregar]);

  const visiveis = useMemo(
    () =>
      (lista ?? [])
        .filter((a) =>
          filtro === "todas" ? true : filtro === "feitas" ? a.meuStatus === "CONCLUIDA" : a.meuStatus !== "CONCLUIDA",
        )
        .filter((a) => !disciplinaId || a.disciplina?.id === disciplinaId),
    [lista, filtro, disciplinaId],
  );

  const aoAtualizar = (a: Atividade) => setLista((l) => l && l.map((x) => (x.id === a.id ? a : x)));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-[28px] font-semibold tracking-tight">Atividades</h1>
        <Botao onClick={() => setNova(true)}>Nova atividade</Botao>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div role="tablist" aria-label="Filtrar por status" className="inline-flex rounded-md border border-linha bg-folha p-0.5">
          {FILTROS.map((f) => (
            <button
              key={f.valor}
              role="tab"
              aria-selected={filtro === f.valor}
              onClick={() => setFiltro(f.valor)}
              className={`rounded px-3 py-1.5 text-sm font-semibold transition-colors ${
                filtro === f.valor ? "bg-tinta text-white" : "text-tinta-suave hover:text-tinta"
              }`}
            >
              {f.nome}
            </button>
          ))}
        </div>
        {disciplinas.length > 0 && (
          <Selecao
            aria-label="Filtrar por disciplina"
            value={disciplinaId}
            onChange={(e) => setDisciplinaId(e.target.value)}
            className="max-w-64 py-1.5 text-sm"
          >
            <option value="">Todas as disciplinas</option>
            {disciplinas.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nome}
              </option>
            ))}
          </Selecao>
        )}
      </div>

      <div className="mt-6">
        {erro ? (
          <Aviso>{erro}</Aviso>
        ) : lista === null ? (
          <Carregando />
        ) : visiveis.length === 0 ? (
          <div className="rounded-lg border border-dashed border-linha bg-folha px-5 py-8">
            <p className="font-semibold">
              {lista.length === 0
                ? "Nenhuma atividade cadastrada."
                : filtro === "feitas"
                  ? "Você ainda não marcou nenhuma como feita."
                  : "Nada aberto com esse filtro."}
            </p>
            {lista.length === 0 && (
              <p className="mt-1 text-sm text-tinta-suave">
                Qualquer pessoa da turma pode cadastrar. Copie a atividade do AVA e coloque o prazo.
              </p>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-linha rounded-lg border border-linha bg-folha">
            {visiveis.map((a) => (
              <AtividadeItem key={a.id} atividade={a} aoAtualizar={aoAtualizar} aoEditar={setEditando} />
            ))}
          </ul>
        )}
      </div>

      <Modal aberto={nova} aoFechar={() => setNova(false)} titulo="Nova atividade">
        <AtividadeForm
          aoSalvar={() => {
            setNova(false);
            carregar();
          }}
        />
      </Modal>
      <Modal aberto={!!editando} aoFechar={() => setEditando(null)} titulo="Editar atividade">
        {editando && (
          <AtividadeForm
            atividade={editando}
            aoSalvar={(a) => {
              setEditando(null);
              aoAtualizar(a);
            }}
            aoExcluir={(id) => {
              setEditando(null);
              setLista((l) => l && l.filter((x) => x.id !== id));
            }}
          />
        )}
      </Modal>
    </div>
  );
}
