"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError, type Turma } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { AreaLogada } from "@/components/AreaLogada";
import { Topo } from "@/components/Topo";
import { Aviso, Botao, Campo, Carregando, Entrada, Modal } from "@/components/ui";

export default function TurmasPage() {
  return (
    <AreaLogada>
      <Topo />
      <Conteudo />
    </AreaLogada>
  );
}

function Conteudo() {
  const { usuario } = useAuth();
  const router = useRouter();
  const [turmas, setTurmas] = useState<Turma[] | null>(null);
  const [erro, setErro] = useState("");
  const [criando, setCriando] = useState(false);

  const carregar = useCallback(() => {
    api.minhasTurmas().then(setTurmas).catch((e: ApiError) => setErro(e.message));
  }, []);

  useEffect(carregar, [carregar]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
      <h1 className="text-[28px] font-semibold tracking-tight">Olá, {usuario?.nome.split(" ")[0]}</h1>
      <p className="mt-1 text-tinta-suave">Escolha uma turma, entre com um código ou crie uma nova.</p>

      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_280px]">
        <section aria-labelledby="minhas">
          <h2 id="minhas" className="mb-3 font-semibold">
            Minhas turmas
          </h2>
          <Aviso>{erro}</Aviso>
          {turmas === null && !erro ? (
            <Carregando />
          ) : turmas && turmas.length === 0 ? (
            <div className="rounded-lg border border-dashed border-linha bg-folha px-5 py-8">
              <p className="font-semibold">Você ainda não está em nenhuma turma.</p>
              <p className="mt-1 text-sm text-tinta-suave">
                Peça o código de convite para quem criou a turma, ou crie a turma e convide os colegas.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-linha overflow-hidden rounded-lg border border-linha bg-folha">
              {turmas?.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/turmas/${t.id}`}
                    className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-papel"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{t.nome}</p>
                      <p className="truncate text-sm text-tinta-suave">
                        {[t.curso, t.semestre].filter(Boolean).join(", ") || "Sem curso informado"}
                      </p>
                    </div>
                    {t.meuPapel === "ADMIN" && (
                      <span className="rounded-full bg-caneta/10 px-2.5 py-0.5 text-xs font-semibold text-caneta">
                        Admin
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="space-y-6">
          <EntrarComCodigo aoEntrar={(t) => router.push(`/turmas/${t.id}`)} />
          <div className="border-t border-linha pt-6">
            <p className="text-sm text-tinta-suave">Vai organizar a sua turma?</p>
            <Botao variante="secundario" className="mt-2 w-full" onClick={() => setCriando(true)}>
              Criar turma
            </Botao>
          </div>
        </aside>
      </div>

      <Modal aberto={criando} aoFechar={() => setCriando(false)} titulo="Criar turma">
        <FormCriarTurma aoCriar={(t) => router.push(`/turmas/${t.id}/turma`)} />
      </Modal>
    </main>
  );
}

function EntrarComCodigo({ aoEntrar }: { aoEntrar: (t: Turma) => void }) {
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Link de convite: /turmas?codigo=ABC234 já preenche o campo.
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("codigo");
    if (c) setCodigo(c.toUpperCase());
  }, []);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      aoEntrar(await api.entrarTurma(codigo));
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Não foi possível entrar na turma.");
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      <Campo rotulo="Entrar com código">
        <Entrada
          required
          maxLength={6}
          placeholder="ABC234"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.toUpperCase())}
          className="text-lg font-semibold tracking-[0.2em] tabular-nums uppercase"
        />
      </Campo>
      <Aviso>{erro}</Aviso>
      <Botao type="submit" carregando={enviando} className="w-full">
        Entrar na turma
      </Botao>
    </form>
  );
}

function FormCriarTurma({ aoCriar }: { aoCriar: (t: Turma) => void }) {
  const [form, setForm] = useState({ nome: "", curso: "", semestre: "" });
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      aoCriar(await api.criarTurma(form));
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Não foi possível criar a turma.");
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-4">
      <Campo rotulo="Nome da turma">
        <Entrada
          required
          autoFocus
          placeholder="ADS 2026 - Turma A"
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
        />
      </Campo>
      <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
        <Campo rotulo="Curso (opcional)">
          <Entrada
            placeholder="Análise e Desenvolvimento de Sistemas"
            value={form.curso}
            onChange={(e) => setForm({ ...form, curso: e.target.value })}
          />
        </Campo>
        <Campo rotulo="Semestre">
          <Entrada placeholder="2026.2" value={form.semestre} onChange={(e) => setForm({ ...form, semestre: e.target.value })} />
        </Campo>
      </div>
      <p className="text-sm text-tinta-suave">Você vira administrador e recebe um código para convidar os colegas.</p>
      <Aviso>{erro}</Aviso>
      <div className="flex justify-end">
        <Botao type="submit" carregando={enviando}>
          Criar turma
        </Botao>
      </div>
    </form>
  );
}
