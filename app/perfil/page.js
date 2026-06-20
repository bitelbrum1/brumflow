"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export default function Perfil() {
  const [user, setUser] = useState(null);
  const [assinatura, setAssinatura] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarPerfil() {
      try {
        const { data } = await supabase.auth.getSession();

        if (!data.session?.user) {
          window.location.href = "/login";
          return;
        }

        setUser(data.session.user);

        const { data: assinaturaData, error } = await supabase
          .from("assinaturas")
          .select("*")
          .eq("user_id", data.session.user.id)
          .maybeSingle();

        if (error) {
          console.error("Erro ao buscar assinatura:", error);
        }

        setAssinatura(assinaturaData);
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      } finally {
        setCarregando(false);
      }
    }

    carregarPerfil();
  }, []);

  function formatarPlano(plano) {
    if (plano === "premium_trimestral") return "Premium Trimestral";
    if (plano === "premium") return "Premium";
    if (plano === "basico") return "Básico";
    return "Sem plano";
  }

  function calcularDiasRestantes(dataExpiracao) {
    if (!dataExpiracao) return null;

    const hoje = new Date();
    const expira = new Date(dataExpiracao);
    const diferenca = expira - hoje;

    if (diferenca <= 0) return 0;

    return Math.ceil(diferenca / (1000 * 60 * 60 * 24));
  }

  function formatarData(data) {
    if (!data) return "Não definida";

    return new Date(data).toLocaleDateString("pt-BR");
  }

  const diasRestantes = calcularDiasRestantes(assinatura?.expira_em);

  if (carregando) {
    return (
      <main className="perfilPage">
        <div className="perfilCard">
          <h1>Carregando perfil...</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="perfilPage">
      <section className="perfilCard">
        <div className="perfilTopo">
          <div className="perfilAvatar">
            {user?.email?.charAt(0).toUpperCase()}
          </div>

          <div>
            <h1>Meu Perfil</h1>
            <p>Informações da sua conta e assinatura.</p>
          </div>
        </div>

        <div className="perfilInfoGrid">
          <div className="perfilInfoBox">
            <span>Email</span>
            <strong>{user?.email}</strong>
          </div>

          <div className="perfilInfoBox">
            <span>Plano atual</span>
            <strong>{formatarPlano(assinatura?.plano)}</strong>
          </div>

          <div className="perfilInfoBox">
            <span>Status</span>
            <strong>{assinatura?.status || "Sem plano"}</strong>
          </div>

          <div className="perfilInfoBox">
            <span>Expira em</span>
            <strong>{formatarData(assinatura?.expira_em)}</strong>
          </div>

          <div className="perfilInfoBox destaque">
            <span>Tempo restante</span>
            <strong>
              {diasRestantes === null
                ? "Não definido"
                : diasRestantes === 0
                ? "Expirado"
                : `${diasRestantes} dias`}
            </strong>
          </div>
        </div>

        <div className="perfilActions">
          <Link href="/" className="perfilBtn">
            ← Voltar
          </Link>

          <Link href="/planos" className="perfilBtnPremium">
            Alterar plano
          </Link>
        </div>
      </section>
    </main>
  );
}