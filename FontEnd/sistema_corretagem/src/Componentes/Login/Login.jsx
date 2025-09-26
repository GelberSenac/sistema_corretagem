import React, { useState } from "react";
import { useAuth } from "../../Contextos/AuthContexto"; // Importa o hook do nosso contexto
import { loginUser } from "../../Servicos/Api";
import "./Login.css";

// A prop { onLoginSuccess } foi removida daqui
function Login() {
  // Pega a função 'login' diretamente do contexto.
  const { login } = useAuth();

  // Estados do formulário
  const [loginField, setLoginField] = useState(""); // Renomeado para não conflitar com a função 'login'
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Estados para a experiência do usuário (UX)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Chama a função da nossa API central
      const response = await loginUser(loginField, password);

      // Extrai o usuário e o token da resposta
      const { user, token } = response.data;

      // Chama a função de login do CONTEXTO, que vai salvar o token e o usuário globalmente
      login(user, token);

      // O App.jsx vai detectar a mudança no estado de autenticação e redirecionar automaticamente
    } catch (err) {
      setError("Login ou senha inválidos. Tente novamente.");
      console.error("Erro de login:", err);
    } finally {
      setLoading(false);
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
            value={loginField}
            onChange={(e) => setLoginField(e.target.value)}
            required
            placeholder="Digite seu login"
            disabled={loading}
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
              disabled={loading}
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

        {error && (
          <p className="error-message" style={{ color: "red" }}>
            {error}
          </p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}

export default Login;
