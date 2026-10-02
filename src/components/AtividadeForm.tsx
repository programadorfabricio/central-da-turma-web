"use client";

import { useState } from "react";
import { api, ApiError, type Atividade, type AtividadeInput, type Tipo } from "@/lib/api";
import { deInputLocal, paraInputLocal } from "@/lib/datas";
import { useTurma } from "./TurmaContexto";
import { ROTULO_TIPO } from "./AtividadeItem";
import { AreaTexto, Aviso, Botao, Campo, Entrada, Selecao } from "./ui";

/** Sugestão de prazo: daqui a 7 dias, 23:59. */
function prazoPadrao() {
  const d = new Date(Date.now() + 7 * 86_400_000);
  const dia = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(d);
  return `${dia}T23:59`;
}

export function AtividadeForm({
  atividade,
  aoSalvar,
  aoExcluir,
}: {
  atividade?: Atividade;
  aoSalvar: (a: Atividade) => void;
  aoExcluir?: (id: string) => void;
}) {
  const { detalhe, disciplinas } = useTurma();
  const [form, setForm] = useState({
    titulo: atividade?.titulo ?? "",
    descricao: atividade?.descricao ?? "",
    link: atividade?.link ?? "",
    tipo: atividade?.tipo ?? ("ATIVIDADE" as Tipo),
    prazo: atividade ? paraInputLocal(atividade.prazo) : prazoPadrao(),
    disciplinaId: atividade?.disciplina?.id ?? "",
  });
  const [erro, setErro] = useState("");
  const [campos, setCampos] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);

  const mudar =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCampos({});
    setEnviando(true);
    const dados: AtividadeInput = {
      titulo: form.titulo,
      descricao: form.descricao || undefined,
      link: form.link || undefined,
      tipo: form.tipo,
      prazo: deInputLocal(form.prazo),
      disciplinaId: form.disciplinaId || null,
    };
    try {
      const salva = atividade
        ? await api.editarAtividade(atividade.id, dados)
        : await api.criarAtividade(detalhe.turma.id, dados);
      aoSalvar(salva);
    } catch (err) {
      if (err instanceof ApiError) {
        setErro(err.message);
        setCampos(err.campos);
      } else setErro("Não foi possível salvar.");
      setEnviando(false);
    }
  }

  async function excluir() {
    if (!atividade || !aoExcluir) return;
    setEnviando(true);
    try {
      await api.excluirAtividade(atividade.id);
      aoExcluir(atividade.id);
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Não foi possível excluir.");
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-4">
      <Campo rotulo="Título" erro={campos.titulo}>
        <Entrada required autoFocus placeholder="Exercício 3 - Modelagem ER" value={form.titulo} onChange={mudar("titulo")} />
      </Campo>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo rotulo="Disciplina">
          <Selecao value={form.disciplinaId} onChange={mudar("disciplinaId")}>
            <option value="">Sem disciplina</option>
            {disciplinas.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nome}
              </option>
            ))}
          </Selecao>
        </Campo>
        <Campo rotulo="Tipo">
          <Selecao value={form.tipo} onChange={mudar("tipo")}>
            {(Object.keys(ROTULO_TIPO) as Tipo[]).map((t) => (
              <option key={t} value={t}>
                {ROTULO_TIPO[t]}
              </option>
            ))}
          </Selecao>
        </Campo>
      </div>

      <Campo rotulo="Prazo" erro={campos.prazo} dica="Horário de Brasília.">
        <Entrada type="datetime-local" required value={form.prazo} onChange={mudar("prazo")} />
      </Campo>

      <Campo rotulo="Link da atividade (opcional)" erro={campos.link}>
        <Entrada type="url" placeholder="https://..." value={form.link} onChange={mudar("link")} />
      </Campo>

      <Campo rotulo="Descrição (opcional)" erro={campos.descricao}>
        <AreaTexto value={form.descricao} onChange={mudar("descricao")} />
      </Campo>

      <Aviso>{erro && !Object.keys(campos).length ? erro : ""}</Aviso>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {atividade && aoExcluir ? (
          confirmandoExclusao ? (
            <span className="flex items-center gap-2 text-sm">
              Excluir para toda a turma?
              <Botao type="button" variante="perigo" onClick={excluir} disabled={enviando}>
                Sim, excluir
              </Botao>
              <Botao type="button" variante="fantasma" onClick={() => setConfirmandoExclusao(false)}>
                Não
              </Botao>
            </span>
          ) : (
            <Botao type="button" variante="perigo" onClick={() => setConfirmandoExclusao(true)}>
              Excluir atividade
            </Botao>
          )
        ) : (
          <span />
        )}
        <Botao type="submit" carregando={enviando}>
          {atividade ? "Salvar alterações" : "Cadastrar atividade"}
        </Botao>
      </div>
    </form>
  );
}
