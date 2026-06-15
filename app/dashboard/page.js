import Link from "next/link";

const ferramentas = [
  {
    icon: "🤖",
    titulo: "Gerador IA",
    texto: "Crie descrições profissionais para produtos em segundos.",
    link: "/gerador",
  },
  {
    icon: "📦",
    titulo: "Estoque",
    texto: "Controle produtos, entradas, saídas e alertas de estoque baixo.",
    link: "/estoque",
  },
  {
    icon: "💰",
    titulo: "Financeiro",
    texto: "Acompanhe receitas, despesas, saldo e movimentações.",
    link: "/financeiro",
  },
  {
    icon: "📅",
    titulo: "Agendamento",
    texto: "Organize compromissos e integre lançamentos ao financeiro.",
    link: "/agendamento",
  },
  {
    icon: "🚀",
    titulo: "Criador de Títulos",
    texto: "Gere títulos e ideias para posts com aparência profissional.",
    link: "/banners",
  },
  
];

export default function Dashboard() {
  return (
    <main className="dashboardPage">
      <section className="dashboardHero">
        <div>
          <span className="dashboardBadge">BrumFlow SaaS</span>
          <h1>Dashboard</h1>
          <p>
            Visão geral da sua plataforma: IA, estoque, financeiro,
            agendamentos e ferramentas para vender mais.
          </p>
        </div>

        <Link href="/gerador" className="dashboardHeroBtn">
          Começar com IA →
        </Link>
      </section>

      <section className="dashboardStats">
        <div>
          <span>Clientes ativos</span>
          <strong>127</strong>
          <small>+18% este mês</small>
        </div>

        <div>
          <span>Descrições geradas</span>
          <strong>542</strong>
          <small>IA em uso</small>
        </div>

        <div>
          <span>Vendas do mês</span>
          <strong>R$ 8.540</strong>
          <small>+24% crescimento</small>
        </div>

        <div>
          <span>Produtos em estoque</span>
          <strong>86</strong>
          <small>12 com alerta baixo</small>
        </div>
      </section>

      <section className="dashboardGrid">
        <div className="dashboardPanel">
          <div className="panelHeader">
            <div>
              <h2>Resumo de vendas</h2>
              <p>Movimento estimado dos últimos dias</p>
            </div>
            <span>Atualizado agora</span>
          </div>

          <div className="fakeChart">
            <span style={{ height: "42%" }}></span>
            <span style={{ height: "58%" }}></span>
            <span style={{ height: "36%" }}></span>
            <span style={{ height: "78%" }}></span>
            <span style={{ height: "64%" }}></span>
            <span style={{ height: "88%" }}></span>
            <span style={{ height: "72%" }}></span>
          </div>
        </div>

        <div className="dashboardPanel">
          <div className="panelHeader">
            <div>
              <h2>Alertas rápidos</h2>
              <p>Pontos que precisam de atenção</p>
            </div>
          </div>

          <div className="alertsList">
            <div>
              <strong>📦 Estoque baixo</strong>
              <span>12 produtos precisam de reposição.</span>
            </div>

            <div>
              <strong>💰 Financeiro</strong>
              <span>3 despesas pendentes para revisar.</span>
            </div>

            <div>
              <strong>📅 Agenda</strong>
              <span>5 compromissos marcados para hoje.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="toolsSection">
        <div className="sectionTitle">
          <h2>Ferramentas do BrumFlow</h2>
          <p>Acesse rapidamente os principais módulos do sistema.</p>
        </div>

        <div className="toolsGrid">
          {ferramentas.map((item) => (
            <Link href={item.link} className="toolCard" key={item.titulo}>
              <div className="toolIcon">{item.icon}</div>
              <h3>{item.titulo}</h3>
              <p>{item.texto}</p>
              <span>Abrir módulo →</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}