"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";
import { buscarOuCriarAssinatura } from "../lib/assinatura";
import { temPermissao } from "../lib/permissoes";

export default function Home() {
  const [userEmail, setUserEmail] = useState("");
  const [plano, setPlano] = useState("sem_plano");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function verificarLogin() {
      const { data } = await supabase.auth.getSession();

      if (data.session?.user?.email) {
        setUserEmail(data.session.user.email);

        const assinatura = await buscarOuCriarAssinatura(data.session.user.id);

       if (assinatura?.plano && assinatura?.status === "ativo") {
  setPlano(assinatura.plano);
} else {
  setPlano("sem_plano");
}
      } else {
        setUserEmail("");
      }

      setCarregando(false);
    }

    verificarLogin();
  }, []);

  const inicial = userEmail ? userEmail.charAt(0).toUpperCase() : "";

  async function sair() {
    await supabase.auth.signOut();
    setUserEmail("");
    window.location.href = "/login";
  }

  const recursos = [
    {
      recurso: "ia-produtos",
      icon: "🤖",
      title: "IA para Produtos",
      text: "Crie descrições completas em segundos com inteligência artificial.",
      link: "/gerador",
    },
    {
      recurso: "estoque",
      icon: "📦",
      title: "Controle de Estoque",
      text: "Gerencie produtos, entradas e saídas de forma simples.",
      link: "/estoque",
    },
    {
      recurso: "financeiro",
      icon: "💰",
      title: "Financeiro",
      text: "Acompanhe fluxo de caixa, receitas, despesas e relatórios.",
      link: "/financeiro",
    },
    {
      recurso: "agendamento",
      icon: "📅",
      title: "Agendamento",
      text: "Organize horários, compromissos e lembretes para clientes.",
      link: "/agendamento",
    },
    {
      recurso: "criador-titulos",
      icon: "🚀",
      title: "Criador de Títulos para Posts",
      text: "Crie títulos e hashtags profissionais com IA para engajar seus posts.",
      link: "/banners",
    },
    {
      recurso: "dashboard",
      icon: "📊",
      title: "Dashboard",
      text: "Veja gráficos de receitas, despesas, lucro, estoque e agendamentos.",
      link: "/dashboard",
    },
    {
      recurso: "clientes",
      icon: "👥",
      title: "Clientes",
      text: "Cadastre clientes, contatos, WhatsApp e observações em um CRM completo.",
      link: "/clientes",
    },
  ];

  if (carregando) {
    return (
      <main className="page">
        <section className="hero">
          <div className="heroText">
            <h1>Carregando BrumFlow...</h1>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <header className="navbar">
        <h2>
          Brum<span>Flow</span>
        </h2>

        <nav>
          {userEmail ? (
            <div className="userArea">
              <div className="userAvatar">{inicial}</div>
              <div className="planoBadge">
  {
    plano === "premium"
      ? "Premium ⭐"
      : plano === "basico"
      ? "Básico"
      : "Sem Plano"
  }
</div>

              {plano === "sem_plano" && (<Link href="/planos" className="assinarBtn">  Assinar plano</Link>)}
              <button onClick={sair} className="logoutBtn">
                Sair
              </button>
            </div>
          ) : (
            <Link href="/login" className="btnLogin">
              Entrar →
            </Link>
          )}
        </nav>
      </header>

      <section className="hero">
        <div className="heroText">
          <div className="badge">🚀 Plataforma completa para negócios</div>

          <h1>
            Automatize vendas, atendimento e gestão com <span>IA</span>
          </h1>

          <p>
            Descrições automáticas, WhatsApp IA, estoque, financeiro e
            agendamentos em uma única plataforma.
          </p>

          <div className="benefits">
            <span></span>
            <span>⚡ Configuração rápida</span>
          </div>
        </div>

        <div className="heroVisual">
          <div className="orb orbOne"></div>
          <div className="orb orbTwo"></div>

          <div className="saasPanel">
            <div className="saasTop">
              <div className="dots">
                <span></span>
                <span></span>
                <span></span>
              </div>

              <div className="liveBadge">Online</div>
            </div>

            <div className="saasHeader">
              <div>
                <small>Receita mensal</small>
                <h3>R$ 12.480</h3>
              </div>

              <div className="growth">+28%</div>
            </div>

            <div className="miniStats">
              <div>
                <span>Pedidos</span>
                <strong>286</strong>
              </div>

              <div>
                <span>Clientes</span>
                <strong>94</strong>
              </div>
            </div>

            <div className="graph">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>

          <div className="floatCard aiFloat">
            <strong>🤖 IA</strong>
            <span>Descrição criada</span>
          </div>

          <div className="floatCard whatsFloat">
            <strong>💬 WhatsApp</strong>
            <span>Cliente respondido</span>
          </div>

          <div className="floatCard moneyFloat">
            <strong>💰 Financeiro</strong>
            <span>Venda registrada</span>
          </div>
        </div>
      </section>

      <section className="features">
        {recursos.map((item, index) => {
         const permitido = temPermissao(plano, item.recurso);
const bloqueado = userEmail && plano !== "sem_plano" && !permitido;
const semPlano = userEmail && plano === "sem_plano";

          return (
            <Link
             href={!userEmail ? "/login" : bloqueado || semPlano ? "/planos" : item.link}
              className={`featureCard ${bloqueado ? "featureBloqueado" : ""}`}
              key={index}
            >
              {bloqueado && <div className="cadeadoPremium">🔒 Premium</div>}
{semPlano && <div className="cadeadoPremium">🔒 Assinar</div>}

              <div className="icon">{item.icon}</div>

              <div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>

                {semPlano && (
  <span className="liberarPremium">
    Assinar plano →
  </span>
)}

{bloqueado && (
  <span className="liberarPremium">
    Assinar Premium →
  </span>
)}
              </div>
            </Link>
          );
        })}
      </section>

      <section className="cta">
        <div>
          <h2>Tudo que você precisa para gerir seu negócio.</h2>
        </div>
      </section>
    </main>
  );
}