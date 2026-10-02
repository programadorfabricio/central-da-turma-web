"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { TelaAcesso } from "@/components/TelaAcesso";
import { Aviso, Botao, Campo, Entrada } from "@/components/ui";

export default function LoginPage() {
  const { entrar, usuario, carregando } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!carregando && usuario) router.replace("/turmas");
  }, [carregando, usuario, router]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      await entrar(email, senha);
      router.replace("/turmas");
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Não foi possível entrar.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <TelaAcesso
      titulo="Entrar"
      subtitulo="Veja o que a turma tem pra entregar e o que já é seu."
      rodape={
        <>
          Ainda não tem conta?{" "}
          <Link href="/cadastro" className="font-semibold text-caneta hover:underline">
            Criar conta
          </Link>
        </>
      }
    >
      <form onSubmit={enviar} className="space-y-4">
        <Campo rotulo="E-mail">
          <Entrada type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Campo>
        <Campo rotulo="Senha">
          <Entrada
            type="password"
            autoComplete="current-password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </Campo>
        <Aviso>{erro}</Aviso>
        <Botao type="submit" carregando={enviando} className="w-full">
          Entrar
        </Botao>
      </form>
    </TelaAcesso>
  );
}
