import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="landingPage">
      <header className="landingHeader">
        <h1>
          Brum<span>Flow</span>
        </h1>

        <nav>
          <Link href="/login" className="landingLogin">
            Entrar
          </Link>

          <Link href="/planos" className="landingCta">
            Ver planos
          </Link>
        </nav>
      </header>

      <section className="landingHero">
        <div className="landingHeroText">
          <div className="landingBadge">🚀 Plataforma completa para negócios</div>

          <h2>Organize seu negócio, venda mais e automatize tarefas com IA.</h2>

          <p>
            O BrumFlow reúne inteligência artificial, financeiro, estoque,
            agendamentos, clientes e dashboard em uma única plataforma simples
            e profissional.
          </p>

          <div className="landingButtons">
            <Link href="/login" className="landingPrimary">
              Começar agora
            </Link>

            <Link href="/planos" className="landingSecondary">
              Ver preços
            </Link>
          </div>
        </div>

        <div className="landingCard">
          <div className="landingCardTop">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <div className="landingMetric">
            <small>Receita mensal</small>
            <strong>R$ 12.480</strong>
            <b>+28%</b>
          </div>

          <div className="landingMiniGrid">
            <div>
              <small>Clientes</small>
              <strong>94</strong>
            </div>

            <div>
              <small>Pedidos</small>
              <strong>286</strong>
            </div>
          </div>

          <div className="landingBars">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </section>

      <section className="landingSections">
        <div className="landingInfo">
          <h3>O que é o BrumFlow?</h3>
          <p>
            É um sistema online para pequenos negócios controlarem tarefas
            importantes do dia a dia em um só lugar, usando automação e IA.
          </p>
        </div>

        <div className="landingInfo">
          <h3>Para quem é?</h3>
          <p>
            Para lojas, prestadores de serviço, autônomos, salões, oficinas,
            pequenos comércios e negócios que precisam de organização.
          </p>
        </div>

        <div className="landingInfo">
          <h3>Quais problemas resolve?</h3>
          <p>
            Ajuda a controlar estoque, financeiro, clientes, agendamentos,
            descrições de produtos, títulos para posts e visão geral do negócio.
          </p>
        </div>

        <div className="landingInfo destaque">
          <h3>Quanto custa?</h3>
          <p>
            Plano Básico para recursos com IA e planos Premium para liberar toda
            a gestão do negócio.
          </p>

          <Link href="/planos">Ver planos →</Link>
        </div>
      </section>
    </main>
  );
}