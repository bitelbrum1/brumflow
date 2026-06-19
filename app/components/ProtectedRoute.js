"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { temPermissao } from "../../lib/permissoes";

export default function ProtectedRoute({ recurso, children }) {
  const router = useRouter();
  const [liberado, setLiberado] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function verificar() {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session?.user) {
        router.push("/login");
        return;
      }

      const userId = sessionData.session.user.id;

      const { data: assinatura, error } = await supabase
        .from("assinaturas")
        .select("plano, status")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.log("Erro ao buscar assinatura:", error);
        router.push("/planos");
        return;
      }

      const planoAtivo =
        assinatura?.status === "ativo" ? assinatura.plano : "sem_plano";

      console.log("Plano detectado:", planoAtivo, "Recurso:", recurso);

      if (!temPermissao(planoAtivo, recurso)) {
        router.push("/planos");
        return;
      }

      setLiberado(true);
      setCarregando(false);
    }

    verificar();
  }, [router, recurso]);

  if (carregando) {
    return (
      <main className="page">
        <h2>Verificando assinatura...</h2>
      </main>
    );
  }

  if (!liberado) return null;

  return children;
}