"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import ProtectedRoute from "../components/ProtectedRoute";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregou, setCarregou] = useState(false);

  const [paginaAtual, setPaginaAtual] = useState(1);
  const clientesPorPagina = 5;


  useEffect(() => {
    carregarClientes();
  }, []);

  async function carregarClientes() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setCarregou(true);
      return;
    }

    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      alert("Erro ao carregar clientes");
      setCarregou(true);
      return;
    }

    setClientes(data || []);
    setCarregou(true);
  }

  async function excluirCliente(id) {
    const confirmar = confirm("Deseja excluir este cliente?");
    if (!confirmar) return;

    const { error } = await supabase
      .from("clientes")
      .delete()
      .eq("id", id);

    if (error) {
      console.log(error);
      alert("Erro ao excluir cliente");
      return;
    }

    carregarClientes();
  }

  const clientesFiltrados = clientes.filter((cliente) => {
    const texto = `${cliente.nome} ${cliente.telefone || ""} ${cliente.whatsapp || ""} ${cliente.email || ""}`.toLowerCase();
    return texto.includes(busca.toLowerCase());
  });
const totalPaginas = Math.ceil(clientesFiltrados.length / clientesPorPagina);

const inicio = (paginaAtual - 1) * clientesPorPagina;
const fim = inicio + clientesPorPagina;

const clientesPaginados = clientesFiltrados.slice(inicio, fim);
  if (!carregou) return null;

  return (
     <ProtectedRoute recurso="clientes">
    <main className="crmPage">
      <section className="crmContainer">
        <Link href="/" className="backLink">← Voltar</Link>

        <div className="crmHeader">
          <div>
            <span>👥 CRM</span>
            <h1>Clientes</h1>
            <p>Organize seus clientes, contatos e observações.</p>
          </div>

          <Link href="/clientes/novo" className="crmHeaderBtn">
            + Novo cliente
          </Link>
        </div>

        <section className="crmList crmListFull">
          <div className="crmListTop">
            <div>
              <h2>Lista de clientes</h2>
              <p>{clientes.length} clientes cadastrados</p>
            </div>

            <input
              placeholder="Pesquisar cliente..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          {clientesFiltrados.length === 0 ? (
            <div className="empty">Nenhum cliente encontrado.</div>
          ) : (
            clientesPaginados.map((cliente) => (
              <div className="clientCard" key={cliente.id}>
                <div>
                  <h3>{cliente.nome}</h3>

                  <p>📞 {cliente.telefone || "Sem telefone"}</p>
                  <p>💬 {cliente.whatsapp || "Sem WhatsApp"}</p>
                  <p>✉️ {cliente.email || "Sem e-mail"}</p>

                  {cliente.observacoes && (
                    <small>{cliente.observacoes}</small>
                  )}
                </div>

                <div className="clientActions">
                  <Link href={`/clientes/${cliente.id}`}>
                    Ver detalhes
                  </Link>

                  {cliente.whatsapp && (
                    <a
                      href={`https://wa.me/55${cliente.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                    >
                      WhatsApp
                    </a>
                  )}

                  <button
                    className="deleteBtn"
                    onClick={() => excluirCliente(cliente.id)}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))
          )}
          {totalPaginas > 1 && (
  <div className="pagination">
    <button
      type="button"
      disabled={paginaAtual === 1}
      onClick={() => setPaginaAtual(paginaAtual - 1)}
    >
      ← Anterior
    </button>

    <span>
      Página {paginaAtual} de {totalPaginas}
    </span>

    <button
      type="button"
      disabled={paginaAtual === totalPaginas}
      onClick={() => setPaginaAtual(paginaAtual + 1)}
    >
      Próxima →
    </button>
  </div>
)}
        </section>
      </section>
    </main>
    </ProtectedRoute>
  );
}