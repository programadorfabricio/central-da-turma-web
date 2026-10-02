import Link from "next/link";
import { Logo } from "./Topo";

/** Moldura das telas de login e cadastro. */
export function TelaAcesso({
  titulo,
  subtitulo,
  children,
  rodape,
}: {
  titulo: string;
  subtitulo: string;
  children: React.ReactNode;
  rodape: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
      <Link href="/" className="mb-8 flex items-center gap-2.5 font-semibold tracking-tight">
        <Logo tamanho={34} />
        <span className="text-lg">Central da Turma</span>
      </Link>
      <h1 className="text-[28px] font-semibold leading-tight tracking-tight">{titulo}</h1>
      <p className="mt-2 text-tinta-suave">{subtitulo}</p>
      <div className="mt-8 rounded-lg border border-linha bg-folha p-5 sm:p-6">{children}</div>
      <p className="mt-6 text-sm text-tinta-suave">{rodape}</p>
    </main>
  );
}
