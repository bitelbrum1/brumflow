"use client";

import { useState } from "react";
import styles from "./Whatsapp.module.css";

export default function WhatsappPage() {
  const [mensagem, setMensagem] = useState("");
  const [resposta, setResposta] = useState("");
  const [tom, setTom] = useState("profissional");
  const [negocio, setNegocio] = useState("BrumFlow");
  const [carregando, setCarregando] = useState(false);

  async function gerarResposta(e) {
    e.preventDefault();

    if (!mensagem.trim()) {
      alert("Digite a mensagem do cliente.");
      return;
    }

    setCarregando(true);
    setResposta("");

    try {
      const res = await fetch("/api/whatsapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mensagem,
          tom,
          negocio,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.erro || "Erro ao gerar resposta.");
      }

      setResposta(data.resposta);
    } catch (error) {
      alert(error.message);
    } finally {
      setCarregando(false);
    }
  }

  async function copiarResposta() {
    if (!resposta) return;
    await navigator.clipboard.writeText(resposta);
    alert("Resposta copiada!");
  }

  function abrirWhatsapp() {
    if (!resposta) return;

    const texto = encodeURIComponent(resposta);
    window.open(`https://wa.me/?text=${texto}`, "_blank");
  }

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <span>BrumFlow IA</span>
        <h1>WhatsApp Inteligente</h1>
        <p>
          Cole a mensagem do cliente e gere uma resposta profissional,
          persuasiva e pronta para enviar.
        </p>
      </section>

      <section className={styles.grid}>
        <form className={styles.card} onSubmit={gerarResposta}>
          <h2>Mensagem do cliente</h2>

          <input
            placeholder="Nome do negócio"
            value={negocio}
            onChange={(e) => setNegocio(e.target.value)}
          />

          <select value={tom} onChange={(e) => setTom(e.target.value)}>
            <option value="profissional">Profissional</option>
            <option value="amigável">Amigável</option>
            <option value="vendedor">Vendedor</option>
            <option value="premium">Premium</option>
            <option value="rápido e direto">Rápido e direto</option>
          </select>

          <textarea
            placeholder="Exemplo: Olá, esse produto ainda está disponível?"
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
          />

          <button type="submit" disabled={carregando}>
            {carregando ? "Gerando resposta..." : "Gerar resposta com IA"}
          </button>
        </form>

        <section className={styles.card}>
          <h2>Resposta pronta</h2>

          <div className={styles.responseBox}>
            {resposta || "A resposta inteligente aparecerá aqui."}
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={copiarResposta} disabled={!resposta}>
              Copiar
            </button>

            <button type="button" onClick={abrirWhatsapp} disabled={!resposta}>
              Abrir no WhatsApp
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}