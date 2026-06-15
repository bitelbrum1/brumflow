"use client";

import { useState } from "react";

const usuarios = [
  {
    nome: "Administrador",
    email: "admin@brumflow.com",
    senha: "123456",
    perfil: "admin",
  },
  {
    nome: "Gustavo",
    email: "gustavo@brumflow.com",
    senha: "123456",
    perfil: "admin",
  },
  {
    nome: "Teste",
    email: "teste@brumflow.com",
    senha: "123456",
    perfil: "usuario",
  },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  function entrar(e) {
    e.preventDefault();

    if (!email || !senha) {
      alert("Preencha email e senha");
      return;
    }

    const usuarioEncontrado = usuarios.find(
      (usuario) =>
        usuario.email.toLowerCase() === email.toLowerCase() &&
        usuario.senha === senha
    );

    if (!usuarioEncontrado) {
      alert("Email ou senha incorretos");
      return;
    }

    localStorage.setItem("brumflow_user", usuarioEncontrado.email);
    localStorage.setItem("brumflow_user_name", usuarioEncontrado.nome);
    localStorage.setItem("brumflow_user_profile", usuarioEncontrado.perfil);

    window.location.href = "/";
  }

  return (
    <main className="loginPage">
      <div className="loginCard">
        <div className="loginLogo">
          Brum<span>Flow</span>
        </div>

        <h1>Bem-vindo de volta</h1>
        <p>Faça login para acessar sua plataforma de vendas com IA.</p>

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

          <button type="submit">Entrar na plataforma</button>
        </form>
      </div>
    </main>
  );
}