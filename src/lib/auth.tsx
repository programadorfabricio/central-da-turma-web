"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api, EVENTO_SESSAO_EXPIRADA, lerToken, salvarToken, type Usuario } from "./api";

interface AuthCtx {
  usuario: Usuario | null;
  /** true enquanto ainda está descobrindo se existe sessão salva */
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  cadastrar: (d: { nome: string; email: string; senha: string; telefone?: string }) => Promise<void>;
  sair: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!lerToken()) {
      setCarregando(false);
      return;
    }
    api
      .me()
      .then(setUsuario)
      .catch(() => salvarToken(null))
      .finally(() => setCarregando(false));
  }, []);

  const sair = useCallback(() => {
    salvarToken(null);
    setUsuario(null);
    router.replace("/login");
  }, [router]);

  useEffect(() => {
    window.addEventListener(EVENTO_SESSAO_EXPIRADA, sair);
    return () => window.removeEventListener(EVENTO_SESSAO_EXPIRADA, sair);
  }, [sair]);

  const entrar = useCallback(async (email: string, senha: string) => {
    const r = await api.login({ email, senha });
    salvarToken(r.token);
    setUsuario(r.usuario);
  }, []);

  const cadastrar = useCallback(
    async (d: { nome: string; email: string; senha: string; telefone?: string }) => {
      const r = await api.cadastro(d);
      salvarToken(r.token);
      setUsuario(r.usuario);
    },
    [],
  );

  const valor = useMemo(
    () => ({ usuario, carregando, entrar, cadastrar, sair }),
    [usuario, carregando, entrar, cadastrar, sair],
  );
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  return c;
}
