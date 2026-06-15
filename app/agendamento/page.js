"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Agendamento() {
  const [servico, setServico] = useState("");
  const [cliente, setCliente] = useState("");
  const [funcionario, setFuncionario] = useState("");
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");
  const [valor, setValor] = useState("");
  const [status, setStatus] = useState("Agendado");
  const [observacao, setObservacao] = useState("");
  const [busca, setBusca] = useState("");
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregou, setCarregou] = useState(false);

  useEffect(() => {
    const salvos = localStorage.getItem("brumflow_agendamentos");
    if (salvos) setAgendamentos(JSON.parse(salvos));
    setCarregou(true);
  }, []);

  useEffect(() => {
    if (carregou) {
      localStorage.setItem("brumflow_agendamentos", JSON.stringify(agendamentos));
    }
  }, [agendamentos, carregou]);

  function converterValor(valorDigitado) {
    return Number(String(valorDigitado).replace(",", ".")) || 0;
  }

  function salvarNoFinanceiro(agendamento, novoStatus) {
    const financeiroSalvo = localStorage.getItem("brumflow_financeiro");
    let financeiro = financeiroSalvo ? JSON.parse(financeiroSalvo) : [];

    financeiro = financeiro.filter(
      (item) => item.origemAgendamentoId !== agendamento.id
    );

    if (novoStatus === "Realizado") {
      financeiro.unshift({
        id: Date.now(),
        descricao: `Serviço realizado: ${agendamento.servico}`,
        valor: converterValor(agendamento.valor),
        tipo: "receita",
        categoria: "Serviços",
        data: new Date().toLocaleDateString("pt-BR"),
        origemAgendamentoId: agendamento.id,
      });
    }

    localStorage.setItem("brumflow_financeiro", JSON.stringify(financeiro));
  }

  function adicionar(e) {
    e.preventDefault();

    if (!servico || !cliente || !data || !horario || !valor) {
      alert("Preencha serviço, cliente, data, horário e valor");
      return;
    }

    const novo = {
      id: Date.now(),
      servico,
      cliente,
      funcionario,
      data,
      horario,
      valor: converterValor(valor),
      status,
      observacao,
    };

    setAgendamentos([novo, ...agendamentos]);

    if (status === "Realizado") {
      salvarNoFinanceiro(novo, "Realizado");
    }

    setServico("");
    setCliente("");
    setFuncionario("");
    setData("");
    setHorario("");
    setValor("");
    setStatus("Agendado");
    setObservacao("");
  }

  function remover(id) {
    setAgendamentos(agendamentos.filter((item) => item.id !== id));

    const financeiroSalvo = localStorage.getItem("brumflow_financeiro");
    let financeiro = financeiroSalvo ? JSON.parse(financeiroSalvo) : [];

    financeiro = financeiro.filter((item) => item.origemAgendamentoId !== id);

    localStorage.setItem("brumflow_financeiro", JSON.stringify(financeiro));
  }

  function atualizarStatus(id, novoStatus) {
    const agendamento = agendamentos.find((item) => item.id === id);

    const atualizados = agendamentos.map((item) =>
      item.id === id ? { ...item, status: novoStatus } : item
    );

    setAgendamentos(atualizados);

    if (agendamento) {
      salvarNoFinanceiro(agendamento, novoStatus);
    }
  }

  const filtrados = agendamentos.filter((item) => {
    const texto = `${item.servico} ${item.cliente} ${item.funcionario} ${item.status}`.toLowerCase();
    return texto.includes(busca.toLowerCase());
  });

  if (!carregou) return null;

  return (
    <main className="scheduleSheetPage">
      <div className="sheetLayout">
        <aside className="sheetSidebar">
          <h2>
            Brum<span>Flow</span>
          </h2>

          <Link href="/" className="sideItem">🏠 Início</Link>
          <Link href="/agendamento" className="sideItem active">📅 Agendamentos</Link>
          <Link href="/financeiro" className="sideItem">💰 Financeiro</Link>
          <Link href="/estoque" className="sideItem">📦 Estoque</Link>
        </aside>

        <section className="sheetContent">
          <Link href="/" className="backLink">← Voltar</Link>

          <div className="sheetHeader">
            <div>
              <h1>Agendamentos</h1>
              <p>
                Controle seus serviços, clientes, horários, valores e status em formato de planilha.
              </p>
            </div>
          </div>

          <form onSubmit={adicionar} className="sheetForm">
            <input
              placeholder="Serviço prestado"
              value={servico}
              onChange={(e) => setServico(e.target.value)}
            />

            <input
              placeholder="Cliente"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
            />

            <input
              placeholder="Funcionário"
              value={funcionario}
              onChange={(e) => setFuncionario(e.target.value)}
            />

            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />

            <input
              type="time"
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
            />

            <input
              className="valorInput"
              type="text"
              inputMode="decimal"
              placeholder="Valor do serviço. Ex: 150,00"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
            />

            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>Agendado</option>
              <option>Realizado</option>
              <option>Cancelado</option>
              <option>Pendente</option>
            </select>

            <input
              placeholder="Observação"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
            />

            <button type="submit">Adicionar</button>
          </form>

          <div className="sheetTools">
            <input
              placeholder="Pesquisar na planilha..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />

            <span>{filtrados.length} registros</span>
          </div>

          <div className="tableWrapper">
            <table className="scheduleTable">
              <thead>
                <tr>
                  <th>Serviço Prestado</th>
                  <th>Cliente</th>
                  <th>Funcionário</th>
                  <th>Data</th>
                  <th>Horário</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Observação</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="emptyTable">
                      Nenhum agendamento cadastrado.
                    </td>
                  </tr>
                ) : (
                  filtrados.map((item) => (
                    <tr key={item.id}>
                      <td>{item.servico}</td>
                      <td>{item.cliente}</td>
                      <td>{item.funcionario || "-"}</td>
                      <td>
                        {new Date(item.data + "T00:00:00").toLocaleDateString("pt-BR")}
                      </td>
                      <td>{item.horario}</td>
                      <td>R$ {converterValor(item.valor).toFixed(2)}</td>
                      <td>
                        <select
                          className={`statusSelect ${item.status.toLowerCase()}`}
                          value={item.status}
                          onChange={(e) => atualizarStatus(item.id, e.target.value)}
                        >
                          <option>Agendado</option>
                          <option>Realizado</option>
                          <option>Cancelado</option>
                          <option>Pendente</option>
                        </select>
                      </td>
                      <td>{item.observacao || "-"}</td>
                      <td>
                        <button
                          type="button"
                          className="deleteTableBtn"
                          onClick={() => remover(item.id)}
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}