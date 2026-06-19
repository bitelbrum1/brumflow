"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import ProtectedRoute from "../components/ProtectedRoute";

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
  const [clientes, setClientes] = useState([]);
  const [clienteId, setClienteId] = useState("");

 useEffect(() => {
  carregarAgendamentos();
  carregarClientes();
}, []);
async function carregarClientes() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return;

  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .eq("user_id", session.user.id)
    .order("nome", { ascending: true });

  if (error) {
    console.log(error);
    return;
  }

  setClientes(data || []);
}
  function converterValor(valorDigitado) {
    return Number(String(valorDigitado).replace(",", ".")) || 0;
  }

  async function carregarAgendamentos() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setCarregou(true);
      return;
    }

    const { data, error } = await supabase
      .from("agendamentos")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });
    if (error) {
      console.log(error);
      alert("Erro ao carregar agendamentos");
      setCarregou(true);
      return;
    }

    setAgendamentos(data || []);
    setCarregou(true);
  }

  async function salvarNoFinanceiro(agendamento, novoStatus) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return;

    await supabase
      .from("financeiro")
      .delete()
      .eq("origem_agendamento_id", agendamento.id)
      .eq("user_id", session.user.id);

    if (novoStatus === "Realizado") {
      await supabase.from("financeiro").insert({
        user_id: session.user.id,
        descricao: `Serviço realizado: ${agendamento.servico}`,
        valor: converterValor(agendamento.valor),
        tipo: "receita",
        categoria: "Serviços",
        origem_agendamento_id: agendamento.id,
      });
    }
  }

  async function adicionar(e) {
    e.preventDefault();

    if (!servico || !cliente || !data || !horario || !valor) {
  alert("Preencha serviço, cliente, data, horário e valor");
  return;
}
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      alert("Usuário não logado");
      return;
    }

     const clienteSelecionado = clientes.find((item) => item.id === clienteId);

const novo = {
  user_id: session.user.id,
  cliente_id: clienteId || null,
  servico,
  cliente: clienteSelecionado?.nome || cliente,
  funcionario,
  data,
  horario,
  valor: converterValor(valor),
  status,
  observacao,
};

    const { data: criado, error } = await supabase
      .from("agendamentos")
      .insert(novo)
      .select()
      .single();

    if (error) {
      console.log(error);
      alert("Erro ao salvar agendamento");
      return;
    }

    if (status === "Realizado") {
      await salvarNoFinanceiro(criado, "Realizado");
    }

    setServico("");
    setCliente("");
    setFuncionario("");
    setData("");
    setHorario("");
    setValor("");
    setStatus("Agendado");
    setObservacao("");
    setClienteId("");

    carregarAgendamentos();
  }

  async function remover(id) {
    const confirmar = confirm("Deseja excluir este agendamento?");
    if (!confirmar) return;

    await supabase.from("financeiro").delete().eq("origem_agendamento_id", id);

    const { error } = await supabase.from("agendamentos").delete().eq("id", id);

    if (error) {
      console.log(error);
      alert("Erro ao excluir agendamento");
      return;
    }

    carregarAgendamentos();
  }

  async function atualizarStatus(id, novoStatus) {
    const agendamento = agendamentos.find((item) => item.id === id);
    if (!agendamento) return;

    const { error } = await supabase
      .from("agendamentos")
      .update({ status: novoStatus })
      .eq("id", id);

    if (error) {
      console.log(error);
      alert("Erro ao atualizar status");
      return;
    }

    await salvarNoFinanceiro(agendamento, novoStatus);
    carregarAgendamentos();
  }

  const filtrados = agendamentos.filter((item) => {
    const texto = `${item.servico} ${item.cliente} ${item.funcionario || ""} ${item.status}`.toLowerCase();
    return texto.includes(busca.toLowerCase());
  });

  if (!carregou) return null;

  return (
     <ProtectedRoute recurso="agendamento">
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
              <p>Controle seus serviços, clientes, horários, valores e status em formato de planilha.</p>
            </div>
          </div>

          <form onSubmit={adicionar} className="sheetForm">
  <input
    placeholder="Serviço prestado"
    value={servico}
    onChange={(e) => setServico(e.target.value)}
  />

  <select
    value={clienteId}
    onChange={(e) => {
      setClienteId(e.target.value);

      const selecionado = clientes.find(
        (item) => item.id === e.target.value
      );

      setCliente(selecionado?.nome || "");
    }}
  >
    <option value="">Selecionar cliente cadastrado</option>

    {clientes.map((item) => (
      <option key={item.id} value={item.id}>
        {item.nome}
      </option>
    ))}
  </select>

  <input
    placeholder="Ou digite o nome do cliente"
    value={cliente}
    onChange={(e) => {
      setCliente(e.target.value);
      setClienteId("");
    }}
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

  <select
    value={status}
    onChange={(e) => setStatus(e.target.value)}
  >
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
            <input placeholder="Pesquisar na planilha..." value={busca} onChange={(e) => setBusca(e.target.value)} />
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
                    <td colSpan="9" className="emptyTable">Nenhum agendamento cadastrado.</td>
                  </tr>
                ) : (
                  filtrados.map((item) => (
                    <tr key={item.id}>
                      <td>{item.servico}</td>
                      <td>{item.cliente}</td>
                      <td>{item.funcionario || "-"}</td>
                      <td>{new Date(item.data + "T00:00:00").toLocaleDateString("pt-BR")}</td>
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
                        <button type="button" className="deleteTableBtn" onClick={() => remover(item.id)}>
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
    </ProtectedRoute>
  );
}