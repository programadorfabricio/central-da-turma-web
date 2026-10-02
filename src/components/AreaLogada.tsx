"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Carregando } from "./ui";

/** Só mostra o conteúdo para quem está logado; os outros vão para /login. */
export function AreaLogada({ children }: { children: React.ReactNode }) {
  const { usuario, carregando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!carregando && !usuario) router.replace("/login");
  }, [carregando, usuario, router]);

  if (carregando || !usuario) {
    return (
      <div className="mx-auto max-w-4xl px-4">
        <Carregando />
      </div>
    );
  }
  return <>{children}</>;
}
