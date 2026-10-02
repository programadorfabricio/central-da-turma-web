// Cliente da API do Spring Boot. Todas as chamadas passam por aqui.

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";
const CHAVE_TOKEN = "cdt.token";

// ---------------------------------------------------------------- tipos

export type Papel = "ADMIN" | "MEMBRO";
export type Status = "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDA";
export type Tipo = "ATIVIDADE" | "PROVA" | "TRABALHO" | "ENTREGA";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
}

export interface Turma {
  id: string;
  nome: string;
  curso: string | null;
  semestre: string | null;
  codigoConvite: string;
  meuPapel: Papel;
}

export interface Membro {
  usuarioId: string;
  nome: string;
  email: string;
  papel: Papel;
  entrouEm: string;
}

export interface TurmaDetalhe {
  turma: Turma;
  membros: Membro[];
}

export interface Disciplina {
  id: string;
  nome: string;
  professor: string | null;
  cor: string | null;
}

export interface Atividade {
  id: string;
  turmaId: string;
  titulo: string;
  descricao: string | null;
  link: string | null;
  tipo: Tipo;
  prazo: string; // ISO em UTC
  disciplina: { id: string; nome: string; cor: string | null } | null;
  meuStatus: Status;
  atrasada: boolean;
  criadoPor: string;
  podeEditar: boolean;
}

export interface Dashboard {
  resumo: { pendentes: number; emAndamento: number; concluidas: number; atrasadas: number };
  atrasadas: Atividade[];
  proximosPrazos: Atividade[];
}

export interface AtividadeInput {
  titulo: string;
  descricao?: string;
  link?: string;
  tipo: Tipo;
  prazo: string;
  disciplinaId?: string | null;
}

// ---------------------------------------------------------------- token

export function lerToken(): string | null {
  try {
    return localStorage.getItem(CHAVE_TOKEN);
  } catch {
    return null;
  }
}

export function salvarToken(token: string | null) {
  try {
    if (token) localStorage.setItem(CHAVE_TOKEN, token);
    else localStorage.removeItem(CHAVE_TOKEN);
  } catch {
    // navegador sem armazenamento: segue só na memória
  }
}

// ---------------------------------------------------------------- requisições

export class ApiError extends Error {
  constructor(
    public status: number,
    mensagem: string,
    public campos: Record<string, string> = {},
  ) {
    super(mensagem);
  }
}

/** Disparado quando o token expira; o AuthProvider escuta e manda pro login. */
export const EVENTO_SESSAO_EXPIRADA = "cdt:sessao-expirada";

async function req<T>(metodo: string, caminho: string, corpo?: unknown): Promise<T> {
  const headers: Record<string, string> = {};
  const token = lerToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (corpo !== undefined) headers["Content-Type"] = "application/json";

  let resposta: Response;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      method: metodo,
      headers,
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    });
  } catch {
    throw new ApiError(0, "Não foi possível falar com o servidor. Confira se a API está rodando.");
  }

  if (resposta.status === 204) return undefined as T;

  const dados = await resposta.json().catch(() => null);
  if (!resposta.ok) {
    if (resposta.status === 401 && token) {
      window.dispatchEvent(new Event(EVENTO_SESSAO_EXPIRADA));
    }
    throw new ApiError(
      resposta.status,
      dados?.erro ?? "Algo deu errado. Tente novamente.",
      dados?.campos ?? {},
    );
  }
  return dados as T;
}

export const api = {
  // auth
  cadastro: (d: { nome: string; email: string; senha: string; telefone?: string }) =>
    req<{ token: string; usuario: Usuario }>("POST", "/auth/cadastro", d),
  login: (d: { email: string; senha: string }) =>
    req<{ token: string; usuario: Usuario }>("POST", "/auth/login", d),
  me: () => req<Usuario>("GET", "/me"),

  // turmas
  minhasTurmas: () => req<Turma[]>("GET", "/turmas"),
  criarTurma: (d: { nome: string; curso?: string; semestre?: string }) => req<Turma>("POST", "/turmas", d),
  entrarTurma: (codigo: string) => req<Turma>("POST", "/turmas/entrar", { codigo }),
  turma: (id: string) => req<TurmaDetalhe>("GET", `/turmas/${id}`),
  novoCodigo: (id: string) => req<Turma>("POST", `/turmas/${id}/novo-codigo`),
  alterarPapel: (turmaId: string, usuarioId: string, papel: Papel) =>
    req<void>("PATCH", `/turmas/${turmaId}/membros/${usuarioId}`, { papel }),
  removerMembro: (turmaId: string, usuarioId: string) =>
    req<void>("DELETE", `/turmas/${turmaId}/membros/${usuarioId}`),

  // disciplinas
  disciplinas: (turmaId: string) => req<Disciplina[]>("GET", `/turmas/${turmaId}/disciplinas`),
  criarDisciplina: (turmaId: string, d: Omit<Disciplina, "id">) =>
    req<Disciplina>("POST", `/turmas/${turmaId}/disciplinas`, d),
  editarDisciplina: (id: string, d: Omit<Disciplina, "id">) => req<Disciplina>("PUT", `/disciplinas/${id}`, d),
  excluirDisciplina: (id: string) => req<void>("DELETE", `/disciplinas/${id}`),

  // atividades
  dashboard: (turmaId: string) => req<Dashboard>("GET", `/turmas/${turmaId}/dashboard`),
  atividades: (turmaId: string) => req<Atividade[]>("GET", `/turmas/${turmaId}/atividades`),
  criarAtividade: (turmaId: string, d: AtividadeInput) =>
    req<Atividade>("POST", `/turmas/${turmaId}/atividades`, d),
  editarAtividade: (id: string, d: AtividadeInput) => req<Atividade>("PUT", `/atividades/${id}`, d),
  excluirAtividade: (id: string) => req<void>("DELETE", `/atividades/${id}`),
  alterarStatus: (id: string, status: Status) => req<Atividade>("PUT", `/atividades/${id}/status`, { status }),
  aviso: (id: string) => req<{ texto: string; whatsappUrl: string }>("POST", `/atividades/${id}/aviso`),
};
