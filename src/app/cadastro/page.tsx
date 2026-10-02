"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { TelaAcesso } from "@/components/TelaAcesso";
import { Aviso, Botao, Campo, Entrada } from "@/components/ui";

export default function CadastroPage() {
  const { cadastrar, usuario, carregando } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ nome: "", email: "", senha: "", telefone: "" });
  const [erro, setErro] = useState("");
  const [campos, setCampos] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!carregando && usuario) router.replace("/turmas");
  }, [carregando, usuario, router]);

  const mudar = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCampos({});
    setEnviando(true);
    try {
      await cadastrar({ ...form, telefone: form.telefone || undefined });
      router.replace("/turmas");
    } catch (err) {
      if (err instanceof ApiError) {
        setErro(err.message);
        setCampos(err.campos);
      } else setErro("Não foi possível criar a conta.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <TelaAcesso
      titulo="Criar conta"
      subtitulo="Depois é só entrar na turma com o código que alguém te passar."
      rodape={
        <>
          Já tem conta?{" "}
          <Link href="/login" className="font-semibold text-caneta hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={enviar} className="space-y-4">
        <Campo rotulo="Nome" erro={campos.nome}>
          <Entrada autoComplete="name" required value={form.nome} onChange={mudar("nome")} />
        </Campo>
        <Campo rotulo="E-mail" erro={campos.email}>
          <Entrada type="email" autoComplete="email" required value={form.email} onChange={mudar("email")} />
        </Campo>
        <Campo rotulo="Senha" erro={campos.senha} dica="Pelo menos 6 caracteres.">
          <Entrada
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={form.senha}
            onChange={mudar("senha")}
          />
        </Campo>
        <Campo rotulo="WhatsApp (opcional)" erro={campos.telefone} dica="Vai servir para os avisos automáticos no futuro.">
          <Entrada type="tel" autoComplete="tel" placeholder="(19) 99999-9999" value={form.telefone} onChange={mudar("telefone")} />
        </Campo>
        <Aviso>{erro && !Object.keys(campos).length ? erro : ""}</Aviso>
        <Botao type="submit" carregando={enviando} className="w-full">
          Criar conta
        </Botao>
      </form>
    </TelaAcesso>
  );
}
