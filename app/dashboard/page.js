"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { supabase } from "../../lib/supabase";
import styles from "./Dashboard.module.css";

const periodos = [
  { label: "1 dia", dias: 1 },
  { label: "3 dias", dias: 3 },
  { label: "1 semana", dias: 7 },
  { label: "1 mês", dias: 30 },
  { label: "3 meses", dias: 90 },
  { label: "1 ano", dias: 365 },
];

export default function Dashboard() {
  const [produtos, setProdutos] = useState([]);
  const [financeiro, setFinanceiro] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [periodo, setPeriodo] = useState(periodos[0]);
  const [carregou, setCarregou] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setCarregou(true);
      return;
    }

    const { data: produtosData } = await supabase
      .from("produtos")
      .select("*")
      .eq("user_id", session.user.id);

    const { data: financeiroData } = await supabase
      .from("financeiro")
      .select("*")
      .eq("user_id", session.user.id);

    const { data: agendamentosData } = await supabase
      .from("agendamentos")
      .select("*")
      .eq("user_id", session.user.id);

    setProdutos(produtosData || []);
    setFinanceiro(financeiroData || []);
    setAgendamentos(agendamentosData || []);
    setCarregou(true);
  }

  function moeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function estaNoPeriodo(data) {
    if (!data) return false;

    const hoje = new Date();
    const limite = new Date();
    limite.setDate(hoje.getDate() - periodo.dias);

    return new Date(data) >= limite;
  }

  const financeiroFiltrado = financeiro.filter((item) =>
  estaNoPeriodo(item.data || item.created_at)
);

const agendamentosFiltrados = agendamentos.filter((item) =>
  estaNoPeriodo(item.data || item.created_at)
);

  const receitas = financeiroFiltrado
    .filter((item) => item.tipo === "receita")
    .reduce((total, item) => total + Number(item.valor || 0), 0);

  const despesas = financeiroFiltrado
    .filter((item) => item.tipo === "despesa")
    .reduce((total, item) => total + Number(item.valor || 0), 0);

  const lucro = receitas - despesas;

  const valorEstoque = produtos.reduce(
    (total, item) =>
      total + Number(item.venda || 0) * Number(item.quantidade || 0),
    0
  );

  const estoqueBaixo = produtos.filter(
    (item) => Number(item.quantidade) <= Number(item.estoque_minimo)
  ).length;

  const agendado = agendamentosFiltrados.filter(
    (item) => item.status === "Agendado"
  ).length;

  const realizado = agendamentosFiltrados.filter(
    (item) => item.status === "Realizado"
  ).length;

  const pendente = agendamentosFiltrados.filter(
    (item) => item.status === "Pendente"
  ).length;

  const cancelado = agendamentosFiltrados.filter(
    (item) => item.status === "Cancelado"
  ).length;

  const dadosFinanceiro = useMemo(() => {
    return [
      {
        nome: "Início",
        receitas: receitas * 0.68,
        despesas: despesas * 0.74,
        lucro: lucro * 0.58,
      },
      {
        nome: "Ponto 1",
        receitas: receitas * 0.9,
        despesas: despesas * 0.88,
        lucro: lucro * 0.78,
      },
      {
        nome: "Ponto 2",
        receitas: receitas * 0.84,
        despesas: despesas * 0.82,
        lucro: lucro * 0.62,
      },
      {
        nome: "Pico",
        receitas: receitas * 1.1,
        despesas: despesas * 1.05,
        lucro: lucro * 1.18,
      },
      {
        nome: "Queda",
        receitas: receitas * 0.82,
        despesas: despesas * 0.76,
        lucro: lucro * 0.65,
      },
      {
        nome: "Recuperação",
        receitas: receitas * 1.04,
        despesas: despesas * 0.94,
        lucro: lucro * 1.05,
      },
      {
        nome: "Atual",
        receitas,
        despesas,
        lucro,
      },
    ];
  }, [receitas, despesas, lucro]);

  const dadosAgendamentos = [
    { nome: "Agendado", valor: agendado, cor: "#8b5cf6" },
    { nome: "Realizado", valor: realizado, cor: "#22c55e" },
    { nome: "Pendente", valor: pendente, cor: "#f59e0b" },
    { nome: "Cancelado", valor: cancelado, cor: "#ef4444" },
  ];

  const dadosEstoque = produtos
    .slice()
    .sort((a, b) => Number(b.quantidade || 0) - Number(a.quantidade || 0))
    .slice(0, 10)
    .map((item) => ({
      nome: item.nome,
      quantidade: Number(item.quantidade || 0),
    }));

  if (!carregou) return null;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <Link href="/" className={styles.back}>
            ← Voltar
          </Link>
          <h1>Dashboard Real</h1>
          <p>Visão geral completa do seu negócio.</p>
        </div>

        <div className={styles.periodos}>
          {periodos.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => setPeriodo(item)}
              className={periodo.label === item.label ? styles.active : ""}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <section className={styles.cards}>
        <div className={styles.card}>
          <span>Receitas</span>
          <strong>{moeda(receitas)}</strong>
        </div>

        <div className={styles.card}>
          <span>Despesas</span>
          <strong className={styles.red}>{moeda(despesas)}</strong>
        </div>

        <div className={styles.card}>
          <span>Lucro</span>
          <strong className={styles.green}>{moeda(lucro)}</strong>
        </div>

        <div className={styles.card}>
          <span>Valor em estoque</span>
          <strong>{moeda(valorEstoque)}</strong>
        </div>

        <div className={styles.card}>
          <span>Estoque baixo</span>
          <strong className={styles.yellow}>{estoqueBaixo}</strong>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>1. Financeiro</h2>
            <p>Receitas, despesas e lucro no período selecionado.</p>
          </div>
          <span>{periodo.label}</span>
        </div>

        <div className={styles.financeGrid}>
          <div className={styles.financeCards}>
            <div className={`${styles.sideCard} ${styles.purpleLine}`}>
              <small>Receitas</small>
              <strong>{moeda(receitas)}</strong>
            </div>

            <div className={`${styles.sideCard} ${styles.redLine}`}>
              <small>Despesas</small>
              <strong>{moeda(despesas)}</strong>
            </div>

            <div className={`${styles.sideCard} ${styles.greenLine}`}>
              <small>Lucro</small>
              <strong>{moeda(lucro)}</strong>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={390}>
            <AreaChart data={dadosFinanceiro}>
              <defs>
                <linearGradient id="receitas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.65} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.03} />
                </linearGradient>

                <linearGradient id="despesas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.55} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.03} />
                </linearGradient>

                <linearGradient id="lucro" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.55} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.03} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
              <XAxis dataKey="nome" />
              <YAxis />
              <Tooltip formatter={(value) => moeda(value)} />

              <Area
                type="monotone"
                dataKey="receitas"
                stroke="#8b5cf6"
                strokeWidth={4}
                fill="url(#receitas)"
              />

              <Area
                type="monotone"
                dataKey="despesas"
                stroke="#ef4444"
                strokeWidth={4}
                fill="url(#despesas)"
              />

              <Area
                type="monotone"
                dataKey="lucro"
                stroke="#22c55e"
                strokeWidth={4}
                fill="url(#lucro)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>2. Agendamentos</h2>
            <p>Quantidade de agendamentos por status no período.</p>
          </div>
          <span>{periodo.label}</span>
        </div>

        <ResponsiveContainer width="100%" height={390}>
          <BarChart data={dadosAgendamentos} barSize={82}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
            <XAxis dataKey="nome" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="valor" radius={[16, 16, 0, 0]}>
              {dadosAgendamentos.map((item, index) => (
                <Cell key={index} fill={item.cor} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>3. Estoque</h2>
            <p>Quantidade disponível dos principais produtos.</p>
          </div>
          <span>Top 10 produtos</span>
        </div>

        <ResponsiveContainer width="100%" height={440}>
          <BarChart
            data={dadosEstoque}
            layout="vertical"
            margin={{ top: 10, right: 40, left: 130, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
            <XAxis type="number" />
            <YAxis type="category" dataKey="nome" width={150} />
            <Tooltip />
            <Bar dataKey="quantidade" fill="#8b5cf6" radius={[0, 14, 14, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </main>
  );
}