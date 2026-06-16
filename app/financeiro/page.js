"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function Financeiro() {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState("receita");
  const [categoria, setCategoria] = useState("Vendas");
  const [outraCategoria, setOutraCategoria] = useState("");
  const [itens, setItens] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregou, setCarregou] = useState(false);

  useEffect(() => {
    carregarFinanceiro();

    const salvosAgendamentos = localStorage.getItem("brumflow_agendamentos");
    if (salvosAgendamentos) {
      setAgendamentos(JSON.parse(salvosAgendamentos));
    }
  }, []);

  async function carregarFinanceiro() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setCarregou(true);
      return;
    }

    const { data, error } = await supabase
      .from("financeiro")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      alert("Erro ao carregar financeiro");
      setCarregou(true);
      return;
    }

    setItens(data || []);
    setCarregou(true);
  }

  function converterValor(valorDigitado) {
    return Number(String(valorDigitado).replace(",", ".")) || 0;
  }

  async function adicionar(e) {
    e.preventDefault();

    if (!descricao || !valor) {
      alert("Preencha descrição e valor");
      return;
    }

    if (categoria === "Outros" && !outraCategoria.trim()) {
      alert("Explique qual é a categoria");
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      alert("Usuário não logado");
      return;
    }

    const novoItem = {
      user_id: session.user.id,
      descricao,
      valor: converterValor(valor),
      tipo,
      categoria: categoria === "Outros" ? outraCategoria : categoria,
    };

    const { error } = await supabase.from("financeiro").insert(novoItem);

    if (error) {
      console.log(error);
      alert("Erro ao salvar lançamento");
      return;
    }

    setDescricao("");
    setValor("");
    setTipo("receita");
    setCategoria("Vendas");
    setOutraCategoria("");

    carregarFinanceiro();
  }

  async function remover(id) {
    const confirmar = confirm("Deseja excluir este lançamento?");
    if (!confirmar) return;

    const { error } = await supabase
      .from("financeiro")
      .delete()
      .eq("id", id);

    if (error) {
      console.log(error);
      alert("Erro ao excluir lançamento");
      return;
    }

    carregarFinanceiro();
  }

  const receitas = itens
    .filter((item) => item.tipo === "receita")
    .reduce((total, item) => total + converterValor(item.valor), 0);

  const despesas = itens
    .filter((item) => item.tipo === "despesa")
    .reduce((total, item) => total + converterValor(item.valor), 0);

  const lucro = receitas - despesas;

  const pendente = agendamentos
    .filter((item) => item.status === "Agendado" || item.status === "Pendente")
    .reduce((total, item) => total + converterValor(item.valor), 0);

  const previsao = lucro + pendente;

  if (!carregou) {
    return null;
  }

  return (
    <main className="financePage">
      <header className="financeHeader">
        <div>
          <Link href="/" className="backLink">
            ← Voltar
          </Link>
          <h1>Financeiro</h1>
          <p>Controle suas receitas, despesas, lucro e valores pendentes.</p>
        </div>
      </header>

      <section className="financeStats">
        <div className="financeCard">
          <span>Receitas</span>
          <strong>R$ {receitas.toFixed(2)}</strong>
        </div>

        <div className="financeCard">
          <span>Despesas</span>
          <strong className="danger">R$ {despesas.toFixed(2)}</strong>
        </div>

        <div className="financeCard">
          <span>Lucro atual</span>
          <strong className={lucro >= 0 ? "success" : "danger"}>
            R$ {lucro.toFixed(2)}
          </strong>
        </div>

        <div className="financeCard">
          <span>Pendente / a receber</span>
          <strong className="warning">R$ {pendente.toFixed(2)}</strong>
        </div>

        <div className="financeCard">
          <span>Saldo previsto</span>
          <strong className="info">R$ {previsao.toFixed(2)}</strong>
        </div>
      </section>

      <section className="financeGrid">
        <form onSubmit={adicionar} className="financeForm">
          <h2>Novo lançamento</h2>

          <input
            type="text"
            placeholder="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />

          <input
            type="text"
            inputMode="decimal"
            placeholder="Valor. Ex: 150,00"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />

          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="receita">Receita</option>
            <option value="despesa">Despesa</option>
          </select>

          <select
            value={categoria}
            onChange={(e) => {
              setCategoria(e.target.value);

              if (e.target.value !== "Outros") {
                setOutraCategoria("");
              }
            }}
          >
            <option>Vendas</option>
            <option>Serviços</option>
            <option>Marketing</option>
            <option>Estoque</option>
            <option>Entrega</option>
            <option>Assinaturas</option>
            <option>Outros</option>
          </select>

          {categoria === "Outros" && (
            <input
              type="text"
              placeholder="Explique qual é essa categoria"
              value={outraCategoria}
              onChange={(e) => setOutraCategoria(e.target.value)}
            />
          )}

          <button type="submit">Adicionar lançamento</button>
        </form>

        <div className="financeList">
          <h2>Lançamentos</h2>

          {itens.length === 0 ? (
            <p className="empty">Nenhum lançamento cadastrado ainda.</p>
          ) : (
            itens.map((item) => (
              <div className="financeItem" key={item.id}>
                <div>
                  <h3>{item.descricao}</h3>
                  <p>
                    {item.categoria} •{" "}
                    {new Date(item.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>

                <div className="itemRight">
                  <strong
                    className={item.tipo === "receita" ? "success" : "danger"}
                  >
                    {item.tipo === "receita" ? "+" : "-"} R${" "}
                    {converterValor(item.valor).toFixed(2)}
                  </strong>

                  <button type="button" onClick={() => remover(item.id)}>
                    Excluir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}