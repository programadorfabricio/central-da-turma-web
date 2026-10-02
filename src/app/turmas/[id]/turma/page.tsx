"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError, type Disciplina, type Membro } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useTurma } from "@/components/TurmaContexto";
import { Aviso, Botao, Campo, Entrada, Modal } from "@/components/ui";

const CORES = ["#2b59c3", "#c8372d", "#2f8f5b", "#d98a00", "#7a4fc9", "#0f8a9d", "#c2417f", "#5b6578"];

export default function TurmaConfigPage() {
  return (
    <div className="space-y-12">
      <Convite />
      <Disciplinas />
      <Membros />
    </div>
  );
}

// ------------------------------------------------------------------ convite

function Convite() {
  const { detalhe, souAdmin, recarregar } = useTurma();
  const { turma } = detalhe;
  const [copiado, setCopiado] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  const link = typeof window !== "undefined" ? `${window.location.origin}/turmas?codigo=${turma.codigoConvite}` : "";
  const mensagem = `Entra na Central da Turma (${turma.nome}) pra gente organizar as atividades e prazos.\n\nCódigo da turma: *${turma.codigoConvite}*\n${link}`;

  async function copiar() {
    try {
      await navigator.clipboard.writeText(turma.codigoConvite);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // sem permissão de área de transferência: o código continua visível na tela
    }
  }

  async function novoCodigo() {
    setGerando(true);
    try {
      await api.novoCodigo(turma.id);
      await recarregar();
    } finally {
      setGerando(false);
      setConfirmando(false);
    }
  }

  return (
    <section aria-labelledby="convite">
      <h1 id="convite" className="text-[28px] font-semibold tracking-tight">
        Convidar a turma
      </h1>
      <p className="mt-1 text-tinta-suave">Quem tiver o código entra como membro e já vê todas as atividades.</p>

      <div className="mt-5 flex flex-wrap items-center gap-4 rounded-lg border border-linha bg-folha px-5 py-5">
        <p className="text-[34px] font-semibold tracking-[0.18em] tabular-nums" aria-label={`Código ${turma.codigoConvite}`}>
          {turma.codigoConvite}
        </p>
        <div className="flex flex-wrap gap-2">
          <Botao variante="secundario" onClick={copiar}>
            {copiado ? "Código copiado" : "Copiar código"}
          </Botao>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(mensagem)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-md bg-visto px-3.5 py-2 text-sm font-semibold text-white hover:brightness-95"
          >
            Mandar convite no WhatsApp
          </a>
        </div>
      </div>

      {souAdmin && (
        <div className="mt-3 text-sm">
          {confirmando ? (
            <span className="flex flex-wrap items-center gap-2">
              O código atual para de funcionar. Gerar outro?
              <Botao variante="perigo" onClick={novoCodigo} carregando={gerando}>
                Gerar novo código
              </Botao>
              <Botao variante="fantasma" onClick={() => setConfirmando(false)}>
                Cancelar
              </Botao>
            </span>
          ) : (
            <button onClick={() => setConfirmando(true)} className="font-semibold text-tinta-suave hover:text-tinta">
              Gerar novo código
            </button>
          )}
        </div>
      )}
    </section>
  );
}

// ------------------------------------------------------------------ disciplinas

function Disciplinas() {
  const { detalhe, disciplinas, souAdmin, recarregar } = useTurma();
  const [editando, setEditando] = useState<Disciplina | "nova" | null>(null);

  return (
    <section aria-labelledby="disciplinas">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="disciplinas" className="text-xl font-semibold tracking-tight">
            Disciplinas
          </h2>
          {!souAdmin && <p className="text-sm text-tinta-suave">Só administradores cadastram disciplinas.</p>}
        </div>
        {souAdmin && (
          <Botao variante="secundario" onClick={() => setEditando("nova")}>
            Adicionar disciplina
          </Botao>
        )}
      </div>

      {disciplinas.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-linha bg-folha px-5 py-6 text-sm text-tinta-suave">
          Nenhuma disciplina ainda.{" "}
          {souAdmin ? "Cadastre as matérias do semestre para organizar as atividades por cor." : ""}
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-linha rounded-lg border border-linha bg-folha">
          {disciplinas.map((d) => (
            <li key={d.id} className="flex items-center gap-3 px-5 py-3">
              <span className="size-3 shrink-0 rounded-full" style={{ background: d.cor ?? "var(--color-tinta-suave)" }} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{d.nome}</p>
                {d.professor && <p className="truncate text-sm text-tinta-suave">{d.professor}</p>}
              </div>
              {souAdmin && (
                <button onClick={() => setEditando(d)} className="text-sm font-semibold text-tinta-suave hover:text-tinta">
                  Editar
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <Modal
        aberto={editando !== null}
        aoFechar={() => setEditando(null)}
        titulo={editando === "nova" ? "Adicionar disciplina" : "Editar disciplina"}
      >
        {editando !== null && (
          <FormDisciplina
            turmaId={detalhe.turma.id}
            disciplina={editando === "nova" ? undefined : editando}
            sugestaoCor={CORES[disciplinas.length % CORES.length]}
            aoTerminar={async () => {
              await recarregar();
              setEditando(null);
            }}
          />
        )}
      </Modal>
    </section>
  );
}

function FormDisciplina({
  turmaId,
  disciplina,
  sugestaoCor,
  aoTerminar,
}: {
  turmaId: string;
  disciplina?: Disciplina;
  sugestaoCor: string;
  aoTerminar: () => Promise<void>;
}) {
  const [form, setForm] = useState({
    nome: disciplina?.nome ?? "",
    professor: disciplina?.professor ?? "",
    cor: disciplina?.cor ?? sugestaoCor,
  });
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  async function executar(acao: () => Promise<unknown>) {
    setErro("");
    setEnviando(true);
    try {
      await acao();
      await aoTerminar();
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Não foi possível salvar.");
      setEnviando(false);
    }
  }

  const dados = { nome: form.nome, professor: form.professor || null, cor: form.cor };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        executar(() => (disciplina ? api.editarDisciplina(disciplina.id, dados) : api.criarDisciplina(turmaId, dados)));
      }}
      className="space-y-4"
    >
      <Campo rotulo="Nome">
        <Entrada required autoFocus placeholder="Banco de Dados" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
      </Campo>
      <Campo rotulo="Professor (opcional)">
        <Entrada value={form.professor} onChange={(e) => setForm({ ...form, professor: e.target.value })} />
      </Campo>
      <fieldset>
        <legend className="mb-1.5 text-sm font-semibold">Cor</legend>
        <div className="flex flex-wrap gap-2">
          {CORES.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Cor ${c}`}
              aria-pressed={form.cor === c}
              onClick={() => setForm({ ...form, cor: c })}
              className={`size-8 rounded-full ring-offset-2 ${form.cor === c ? "ring-2 ring-tinta" : ""}`}
              style={{ background: c }}
            />
          ))}
        </div>
      </fieldset>
      <Aviso>{erro}</Aviso>
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {disciplina ? (
          confirmando ? (
            <span className="flex flex-wrap items-center gap-2 text-sm">
              As atividades ficam sem disciplina.
              <Botao type="button" variante="perigo" onClick={() => executar(() => api.excluirDisciplina(disciplina.id))}>
                Excluir
              </Botao>
              <Botao type="button" variante="fantasma" onClick={() => setConfirmando(false)}>
                Cancelar
              </Botao>
            </span>
          ) : (
            <Botao type="button" variante="perigo" onClick={() => setConfirmando(true)}>
              Excluir disciplina
            </Botao>
          )
        ) : (
          <span />
        )}
        <Botao type="submit" carregando={enviando}>
          {disciplina ? "Salvar alterações" : "Adicionar disciplina"}
        </Botao>
      </div>
    </form>
  );
}

// ------------------------------------------------------------------ membros

function Membros() {
  const { detalhe, souAdmin, recarregar } = useTurma();
  const { usuario } = useAuth();
  const router = useRouter();
  const [erro, setErro] = useState("");
  const [saindo, setSaindo] = useState(false);

  async function executar(acao: () => Promise<unknown>) {
    setErro("");
    try {
      await acao();
      await recarregar();
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Não foi possível concluir.");
    }
  }

  async function sair() {
    setErro("");
    try {
      await api.removerMembro(detalhe.turma.id, usuario!.id);
      router.replace("/turmas");
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Não foi possível sair da turma.");
      setSaindo(false);
    }
  }

  return (
    <section aria-labelledby="membros">
      <h2 id="membros" className="text-xl font-semibold tracking-tight">
        Membros <span className="font-normal text-tinta-suave">({detalhe.membros.length})</span>
      </h2>
      <div className="mt-2">
        <Aviso>{erro}</Aviso>
      </div>
      <ul className="mt-4 divide-y divide-linha rounded-lg border border-linha bg-folha">
        {detalhe.membros.map((m: Membro) => {
          const souEu = m.usuarioId === usuario?.id;
          return (
            <li key={m.usuarioId} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">
                  {m.nome} {souEu && <span className="font-normal text-tinta-suave">(você)</span>}
                </p>
                <p className="truncate text-sm text-tinta-suave">{m.email}</p>
              </div>
              {m.papel === "ADMIN" && (
                <span className="rounded-full bg-caneta/10 px-2.5 py-0.5 text-xs font-semibold text-caneta">Admin</span>
              )}
              {souAdmin && !souEu && (
                <div className="flex gap-3 text-sm font-semibold">
                  <button
                    className="text-tinta-suave hover:text-tinta"
                    onClick={() =>
                      executar(() =>
                        api.alterarPapel(detalhe.turma.id, m.usuarioId, m.papel === "ADMIN" ? "MEMBRO" : "ADMIN"),
                      )
                    }
                  >
                    {m.papel === "ADMIN" ? "Tirar admin" : "Tornar admin"}
                  </button>
                  <button
                    className="text-correcao hover:underline"
                    onClick={() => executar(() => api.removerMembro(detalhe.turma.id, m.usuarioId))}
                  >
                    Remover
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-4 text-sm">
        {saindo ? (
          <span className="flex flex-wrap items-center gap-2">
            Sair de {detalhe.turma.nome}? Você pode voltar com o código.
            <Botao variante="perigo" onClick={sair}>
              Sair da turma
            </Botao>
            <Botao variante="fantasma" onClick={() => setSaindo(false)}>
              Cancelar
            </Botao>
          </span>
        ) : (
          <button onClick={() => setSaindo(true)} className="font-semibold text-correcao hover:underline">
            Sair da turma
          </button>
        )}
      </div>
    </section>
  );
}
