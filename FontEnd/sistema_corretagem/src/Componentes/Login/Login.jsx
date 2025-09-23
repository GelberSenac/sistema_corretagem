// src/componentes/Login/Login.jsx

import React, { useState } from "react";
import "./Login.css";

function Login({ onLoginSuccess }) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // O body precisa estar formatado corretamente com o objeto 'usuario'
        body: JSON.stringify({
          usuario: {
            login: login,
            senha: password,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onLoginSuccess(data.role);
      } else {
        alert("Login ou senha inválidos. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro de rede:", error);
      alert("Não foi possível conectar ao servidor. Verifique o console.");
    }
  };

  return (
    <div className="login-container">
      <h2>Acesso ao Sistema</h2>
      <form onSubmit={handleLogin}>
        <label>
          Login:
          <input
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            required
            placeholder="Digite seu login"
            // Remova o atributo 'name' para evitar o erro de parâmetros duplicados
          />
        </label>
        <label>
          Senha:
          <div className="password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Digite sua senha"
              // Remova o atributo 'name'
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
        </label>
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}

export default Login;
