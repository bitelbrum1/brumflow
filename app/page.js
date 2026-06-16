"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [userEmail, setUserEmail] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function verificarLogin() {
      const { data } = await supabase.auth.getSession();

      if (data.session?.user?.email) {
        setUserEmail(data.session.user.email);
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
  { icon: "🤖", title: "IA para Produtos", text: "Crie descrições completas em segundos com inteligência artificial.", link: "/gerador" },
  { icon: "📦", title: "Controle de Estoque", text: "Gerencie produtos, entradas e saídas de forma simples.", link: "/estoque" },
  { icon: "💰", title: "Financeiro", text: "Acompanhe fluxo de caixa, receitas, despesas e relatórios.", link: "/financeiro" },
  { icon: "📅", title: "Agendamento", text: "Organize horários, compromissos e lembretes para clientes.", link: "/agendamento" },
  { icon: "🚀", title: "Criador de Títulos para Posts", text: "Crie títulos e hashtags profissionais com IA para engajar seus posts.", link: "/banners" },
  { icon: "📊", title: "Dashboard", text: "Veja gráficos de receitas, despesas, lucro, estoque e agendamentos.", link: "/dashboard" },
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
        <h2>Brum<span>Flow</span></h2>

        <nav>
          {userEmail ? (
            <div className="userArea">
              <div className="userAvatar">{inicial}</div>
              <button onClick={sair} className="logoutBtn">Sair</button>
            </div>
          ) : (
            <Link href="/login" className="btnLogin">Entrar →</Link>
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

          <div className="heroActions">
           
          </div>

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
        {recursos.map((item, index) => (
          <Link href={userEmail ? item.link : "/login"} className="featureCard" key={index}>
            <div className="icon">{item.icon}</div>
            <div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          </Link>
        ))}
      </section>

      <section className="cta">
        <div>
          <h1>Tudo que você precisa para vender mais.</h1>
        </div>

        <Link href={userEmail ? "/gerador" : "/login"} className="primaryBtn">
          Começar agora →
        </Link>
      </section>
    </main>
  );
}