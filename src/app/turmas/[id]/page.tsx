"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError, type Atividade, type Dashboard } from "@/lib/api";
import { useTurma } from "@/components/TurmaContexto";
import { AtividadeItem } from "@/components/AtividadeItem";
import { AtividadeForm } from "@/components/AtividadeForm";
import { Aviso, Botao, Carregando, Modal } from "@/components/ui";

function plural(n: number, um: string, varios: string) {
  return `${n} ${n === 1 ? um : varios}`;
}

export default function PainelPage() {
  const { detalhe } = useTurma();
  const turmaId = detalhe.turma.id;
  const [dados, setDados] = useState<Dashboard | null>(null);
  const [erro, setErro] = useState("");
  const [nova, setNova] = useState(false);
  const [editando, setEditando] = useState<Atividade | null>(null);

  const carregar = useCallback(() => {
    api
      .dashboard(turmaId)
      .then(setDados)
      .catch((e: ApiError) => setErro(e.message));
  }, [turmaId]);

  useEffect(carregar, [carregar]);

  // Mudou o status: atualiza a linha na hora e, logo depois, recarrega o painel
  // para recalcular as contagens (que incluem atividades fora destas listas).
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const aoAtualizar = (a: Atividade) => {
    setDados((d) =>
      d && {
        ...d,
        atrasadas: d.atrasadas.map((x) => (x.id === a.id ? a : x)),
        proximosPrazos: d.proximosPrazos.map((x) => (x.id === a.id ? a : x)),
      },
    );
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(carregar, 800);
  };

  if (erro) return <Aviso>{erro}</Aviso>;
  if (!dados) return <Carregando />;

  const { resumo } = dados;
  const abertas = resumo.pendentes + resumo.emAndamento;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl">
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight">
            {abertas === 0 ? "Tudo em dia." : `${plural(abertas, "atividade aberta", "atividades abertas")}.`}
          </h1>
          <p className="mt-1 text-tinta-suave">
            {abertas === 0 && resumo.concluidas === 0
              ? "Nenhuma atividade cadastrada ainda. Cadastre a primeira e a turma inteira vê."
              : [
                  resumo.emAndamento > 0 && `${resumo.emAndamento} em andamento`,
                  resumo.atrasadas > 0 && `${plural(resumo.atrasadas, "atrasada", "atrasadas")}`,
                  `${plural(resumo.concluidas, "feita", "feitas")}`,
                ]
                  .filter(Boolean)
                  .join(", ") + "."}
          </p>
        </div>
        <Botao onClick={() => setNova(true)}>Nova atividade</Botao>
      </div>

      {dados.atrasadas.length > 0 && (
        <section className="mt-10" aria-labelledby="atrasadas">
          <h2 id="atrasadas" className="mb-3 font-semibold text-correcao">
            Atrasadas
          </h2>
          <ul className="divide-y divide-linha rounded-lg border border-correcao/30 bg-folha">
            {dados.atrasadas.map((a) => (
              <AtividadeItem key={a.id} atividade={a} aoAtualizar={aoAtualizar} aoEditar={setEditando} />
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10" aria-labelledby="proximos">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 id="proximos" className="font-semibold">
            Próximos 7 dias
          </h2>
          <Link href={`/turmas/${turmaId}/atividades`} className="text-sm font-semibold text-caneta hover:underline">
            Ver todas
          </Link>
        </div>
        {dados.proximosPrazos.length === 0 ? (
          <div className="rounded-lg border border-dashed border-linha bg-folha px-5 py-8 text-sm text-tinta-suave">
            Nada vencendo nos próximos 7 dias.
          </div>
        ) : (
          <ul className="divide-y divide-linha rounded-lg border border-linha bg-folha">
            {dados.proximosPrazos.map((a) => (
              <AtividadeItem key={a.id} atividade={a} aoAtualizar={aoAtualizar} aoEditar={setEditando} />
            ))}
          </ul>
        )}
      </section>

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
            aoSalvar={() => {
              setEditando(null);
              carregar();
            }}
            aoExcluir={() => {
              setEditando(null);
              carregar();
            }}
          />
        )}
      </Modal>
    </div>
  );
}
