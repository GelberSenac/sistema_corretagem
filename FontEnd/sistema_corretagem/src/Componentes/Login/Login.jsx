import React, { useState } from "react";
// Importa o CSS da mesma pasta
import "./Login.css";

function Login({ onLoginSuccess }) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState(""); // O estado foi renomeado para 'password'
  const [showPassword, setShowPassword] = useState(false); // Novo estado para exibir a senha

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario: {
            login: login,
            senha: password, // Mantenha 'senha' aqui para o backend,
          },
        }),
      });

      if (response.ok) {
        // Se a resposta for bem-sucedida (status 200),
        // significa que as credenciais são válidas
        onLoginSuccess();
      } else {
        // Se a resposta for um erro (ex: 401),
        // significa que as credenciais são inválidas
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
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
            >
              {/* O conteúdo do botão muda com base no estado */}
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
