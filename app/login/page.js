"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

async function entrar(e) {
  e.preventDefault();

  if (!email || !senha) {
    alert("Preencha email e senha");
    return;
  }

  setCarregando(true);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  setCarregando(false);

  if (error) {
    alert(error.message);
    console.log(error);
    return;
  }

  window.location.href = "/";
}

  async function cadastrar() {
    if (!email || !senha) {
      alert("Preencha email e senha para criar a conta");
      return;
    }

    setCarregando(true);

    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
    });

    setCarregando(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Conta criada com sucesso! Agora faça login.");
  }

  return (
    <main className="loginPage">
      <div className="loginCard">
        <div className="loginLogo">
          Brum<span>Flow</span>
        </div>

        <h1>Bem-vindo de volta</h1>
        <p>Entre ou crie sua conta para acessar o BrumFlow.</p>

        <form onSubmit={entrar} className="loginForm">
          <input
            type="email"
            placeholder="Seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />

          <button type="submit" disabled={carregando}>
            {carregando ? "Entrando..." : "Entrar na plataforma"}
          </button>

          <button
            type="button"
            onClick={cadastrar}
            disabled={carregando}
            style={{
              marginTop: "10px",
              background: "transparent",
              border: "1px solid #7c3aed",
              color: "#7c3aed",
            }}
          >
            Criar conta
          </button>
        </form>
      </div>
    </main>
  );
}