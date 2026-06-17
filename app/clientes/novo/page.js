"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function NovoCliente() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function salvarCliente(e) {
    e.preventDefault();

    if (!nome) {
      alert("Preencha o nome do cliente");
      return;
    }

    setSalvando(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      alert("Usuário não logado");
      setSalvando(false);
      return;
    }

    const { error } = await supabase.from("clientes").insert({
      user_id: session.user.id,
      nome,
      telefone,
      whatsapp,
      email,
      observacoes,
    });

    setSalvando(false);

    if (error) {
      console.log(error);
      alert("Erro ao salvar cliente");
      return;
    }

    router.push("/clientes");
  }

  return (
    <main className="crmPage">
      <section className="crmContainer">
        <Link href="/clientes" className="backLink">← Voltar para clientes</Link>

        <div className="crmHeader">
          <div>
            <span>➕ Novo cliente</span>
            <h1>Cadastrar cliente</h1>
            <p>Adicione um novo cliente ao seu CRM.</p>
          </div>
        </div>

        <form onSubmit={salvarCliente} className="crmForm crmFormPage">
          <h2>Dados do cliente</h2>

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
            {salvando ? "Salvando..." : "Cadastrar cliente"}
          </button>
        </form>
      </section>
    </main>
  );
}