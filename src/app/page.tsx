"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function Inicio() {
  const { usuario, carregando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!carregando) router.replace(usuario ? "/turmas" : "/login");
  }, [carregando, usuario, router]);

  return null;
}
