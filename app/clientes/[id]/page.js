"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function DetalhesCliente() {
  const { id } = useParams();
  const router = useRouter();

  const [cliente, setCliente] = useState(null);
  const [carregou, setCarregou] = useState(false);
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    carregarCliente();
  }, []);

  async function carregarCliente() {
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
      .eq("id", id)
      .eq("user_id", session.user.id)
      .single();

    if (error) {
      console.log(error);
      alert("Cliente não encontrado");
      router.push("/clientes");
      return;
    }

    setCliente(data);
    setNome(data.nome || "");
    setTelefone(data.telefone || "");
    setWhatsapp(data.whatsapp || "");
    setEmail(data.email || "");
    setObservacoes(data.observacoes || "");
    setCarregou(true);
  }

  async function salvarAlteracoes(e) {
    e.preventDefault();

    if (!nome) {
      alert("Preencha o nome do cliente");
      return;
    }

    setSalvando(true);

    const { error } = await supabase
      .from("clientes")
      .update({
        nome,
        telefone,
        whatsapp,
        email,
        observacoes,
      })
      .eq("id", id);

    setSalvando(false);

    if (error) {
      console.log(error);
      alert("Erro ao atualizar cliente");
      return;
    }

    setEditando(false);
    carregarCliente();
  }

  async function excluirCliente() {
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

    router.push("/clientes");
  }

  if (!carregou) return null;
  if (!cliente) return null;

  return (
    <main className="crmPage">
      <section className="crmContainer">
        <Link href="/clientes" className="backLink">← Voltar para clientes</Link>

        <div className="crmHeader">
          <div>
            <span>👤 Cliente</span>
            <h1>{cliente.nome}</h1>
            <p>Detalhes, contatos e observações do cliente.</p>
          </div>

          <div className="clientHeaderActions">
            <button onClick={() => setEditando(!editando)}>
              {editando ? "Cancelar" : "Editar"}
            </button>

            <button className="deleteBtn" onClick={excluirCliente}>
              Excluir
            </button>
          </div>
        </div>

        {editando ? (
          <form onSubmit={salvarAlteracoes} className="crmForm crmFormPage">
            <h2>Editar cliente</h2>

            <input
              placeholder="Nome do cliente"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />

            <input
              placeholder="Telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />

            <input
              placeholder="WhatsApp"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
            />

            <input
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <textarea
              placeholder="Observações"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />

            <button type="submit" disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar alterações"}
            </button>
          </form>
        ) : (
          <section className="clientDetailsGrid">
            <div className="clientDetailCard">
              <span>Nome</span>
              <strong>{cliente.nome}</strong>
            </div>

            <div className="clientDetailCard">
              <span>Telefone</span>
              <strong>{cliente.telefone || "Não informado"}</strong>
            </div>

            <div className="clientDetailCard">
              <span>WhatsApp</span>
              <strong>{cliente.whatsapp || "Não informado"}</strong>

              {cliente.whatsapp && (
                <a
                  href={`https://wa.me/55${cliente.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                >
                  Abrir WhatsApp
                </a>
              )}
            </div>

            <div className="clientDetailCard">
              <span>E-mail</span>
              <strong>{cliente.email || "Não informado"}</strong>
            </div>

            <div className="clientDetailCard full">
              <span>Observações</span>
              <p>{cliente.observacoes || "Nenhuma observação cadastrada."}</p>
            </div>

            <div className="clientDetailCard full">
              <span>Histórico</span>
              <p>Em breve: agendamentos, compras e valores vinculados a este cliente.</p>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}