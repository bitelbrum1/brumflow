"use client";

import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function Planos() {
  async function assinar(plano) {


  const { data } = await supabase.auth.getSession();
  

  if (!data.session?.user) {
    window.location.href = "/login";
    return;
  }

  const email = data.session.user.email;
  const userId = data.session.user.id;

  const response = await fetch("/api/mercado-pago/criar-assinatura", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      plano,
      email,
      userId,
    }),
  });

  const resultado = await response.json();

  if (!response.ok) {
    alert(resultado.error || "Erro ao criar assinatura.");
    return;
  }

  window.location.href = resultado.init_point;
}
  return (
    <main className="planosPage">
      <section className="planosHero">
        <div className="planosBadge">🚀 BrumFlow Planos</div>

        <h1>Escolha seu plano</h1>

        <p>
          Comece com IA no plano Básico ou libere toda a gestão no Premium.
        </p>
      </section>

      <section className="planosGrid tresPlanos">
        <div className="planoCard">
          <h2>Básico</h2>

          <h3>
            R$ 29,90<span>/mês</span>
          </h3>

          <p className="planoDescricao">
            Ideal para quem quer usar inteligência artificial para vender melhor.
          </p>

          <ul>
            <li>IA para Produtos</li>
            <li>Criador de Títulos para Posts</li>
          </ul>
        <button className="btnBasico" onClick={() => assinar("basico_mensal")}>
          Assinar Básico
        </button>
        </div>

        <div className="planoCard premium">
          <div className="badgePremium">Premium</div>

          <h2>Premium Mensal</h2>

          <h3>
            R$ 69,90<span>/mês</span>
          </h3>

          <p className="planoDescricao">
            Para quem quer controle completo do negócio, sem fidelidade.
          </p>

          <ul>
            <li>IA para Produtos</li>
            <li>Criador de Títulos para Posts</li>
            <li>Financeiro</li>
            <li>Controle de Estoque</li>
            <li>Agendamento</li>
            <li>Clientes CRM</li>
            <li>Dashboard</li>
            <li>WhatsApp IA futuramente</li>
            <li>Nota fiscal futuramente</li>
          </ul>

          <button className="btnPremium" onClick={() => assinar("premium_mensal")}>
  Assinar Premium Mensal
</button>
        </div>

        <div className="planoCard premium destaquePlano">
          <div className="badgePremium">Mais vantajoso</div>

          <h2>Premium Trimestral</h2>

          <h3>
            R$ 54,90<span>/mês</span>
          </h3>

          <p className="planoDescricao">
            Permanência mínima de 3 meses. Cobrança mensal de R$ 54,90.
          </p>

          <div className="economiaBox">
            Economize R$15,00 por mês.
          </div>

          <ul>
            <li>Todos os recursos do Premium</li>
           
            <li>Preço reduzido por fidelidade</li>
            <li>Permanência mínima de 3 meses</li>
          </ul>

          <button className="btnPremiumTrimestral" onClick={() => assinar("premium_trimestral")}>
  Assinar Premium Trimestral
</button>
        </div>
      </section>

      <Link href="/" className="voltarPlanos">
        ← Voltar para o sistema
      </Link>
    </main>
  );
}