"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { AreaLogada } from "@/components/AreaLogada";
import { Topo } from "@/components/Topo";
import { TurmaProvider, useTurma } from "@/components/TurmaContexto";

export default function TurmaLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>();
  return (
    <AreaLogada>
      <TurmaProvider turmaId={id}>
        <Topo>
          <NomeTurma />
        </Topo>
        <Abas turmaId={id} />
        <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
      </TurmaProvider>
    </AreaLogada>
  );
}

function NomeTurma() {
  const { detalhe } = useTurma();
  return (
    <p className="truncate border-l border-linha pl-3 text-sm font-semibold text-tinta-suave">{detalhe.turma.nome}</p>
  );
}

function Abas({ turmaId }: { turmaId: string }) {
  const caminho = usePathname();
  const base = `/turmas/${turmaId}`;
  const abas = [
    { href: base, nome: "Painel" },
    { href: `${base}/atividades`, nome: "Atividades" },
    { href: `${base}/turma`, nome: "Turma" },
  ];
  return (
    <nav className="border-b border-linha bg-folha" aria-label="Seções da turma">
      <div className="mx-auto flex max-w-4xl gap-1 px-4">
        {abas.map((a) => {
          const ativa = caminho === a.href;
          return (
            <Link
              key={a.href}
              href={a.href}
              aria-current={ativa ? "page" : undefined}
              className={`-mb-px border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors ${
                ativa ? "border-caneta text-tinta" : "border-transparent text-tinta-suave hover:text-tinta"
              }`}
            >
              {a.nome}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
