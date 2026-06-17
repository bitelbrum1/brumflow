"use client";

import Link from "next/link";

export default function Planos() {
  return (
    <main className="planosPage">
      <section className="planosHero">
        <div className="planosBadge">🚀 BrumFlow Planos</div>
        <h1>Escolha seu plano</h1>
        <p>Comece com o Básico ou libere tudo com o Premium.</p>
      </section>

      <section className="planosGrid">
        <div className="planoCard">
          <h2>Básico</h2>
          <h3>R$ 29,90<span>/mês</span></h3>

          <p className="planoDescricao">
            Ideal para quem quer usar IA e controlar o financeiro.
          </p>

          <ul>
            <li>IA para Produtos</li>
            <li>Criador de Títulos</li>
            <li>Financeiro</li>
          </ul>

          <button className="btnBasico">Assinar Básico</button>
        </div>

        <div className="planoCard premium">
          <div className="badgePremium">Mais completo</div>

          <h2>Premium</h2>
          <h3>R$ 59,90<span>/mês</span></h3>

          <p className="planoDescricao">
            Para quem quer controlar todo o negócio em uma plataforma.
          </p>

          <ul>
            <li>IA para Produtos</li>
            <li>Criador de Títulos</li>
            <li>Financeiro</li>
            <li>Controle de Estoque</li>
            <li>Agendamento</li>
            <li>Clientes CRM</li>
            <li>Dashboard</li>
            <li>WhatsApp IA futuramente</li>
            <li>Nota fiscal futuramente</li>
          </ul>

          <button className="btnPremium">Assinar Premium</button>
        </div>
      </section>

      <Link href="/" className="voltarPlanos">
        ← Voltar para o sistema
      </Link>
    </main>
  );
}