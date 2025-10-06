import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../../Contextos/AuthContexto";
import { loginUser } from "../../Servicos/Api";
import "./Login.css";

function Login() {
  const { login } = useAuth();

  // Estados do formulário
  const [loginField, setLoginField] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Estados para a experiência do usuário (UX)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validação customizada em PT-BR para evitar mensagens nativas do navegador
    if (!loginField || !loginField.trim()) {
      setError("Informe o login.");
      setLoading(false);
      return;
    }
    if (!password || !password.trim()) {
      setError("Informe a senha.");
      setLoading(false);
      return;
    }

    try {
      const response = await loginUser(loginField, password);
      const { user, token } = response.data;
      login(user, token);
    } catch (err) {
      // --- MELHORIA 1: MENSAGENS DE ERRO DETALHADAS ---
      // Inspeciona o objeto de erro do axios para dar feedback mais preciso.
      if (err.response) {
        // O servidor respondeu com um status de erro (4xx, 5xx)
        if (err.response.status === 401) {
          setError("Login ou senha inválidos. Tente novamente.");
        } else {
          setError("Ocorreu um erro no servidor. Tente mais tarde.");
        }
      } else if (err.request) {
        // A requisição foi feita mas não houve resposta
        setError("Não foi possível conectar ao servidor. Verifique sua rede.");
      } else {
        // Algum outro erro ocorreu ao configurar a requisição
        setError("Ocorreu um erro inesperado. Tente novamente.");
      }
      console.error("Erro de login:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Acesso ao Sistema</h2>
      <form onSubmit={handleLogin} noValidate>
        {/* --- MELHORIA 2: ACESSIBILIDADE com htmlFor --- */}
        {/* Adicionamos 'htmlFor' ao label e 'id' ao input para ligá-los. */}
        <label htmlFor="login-input">Login:</label>
        <input
          id="login-input" // 'id' correspondente
          type="text"
          value={loginField}
          onChange={(e) => setLoginField(e.target.value)}
          placeholder="Digite seu login"
          disabled={loading}
        />

        <label htmlFor="password-input">Senha:</label>
        <div className="password-field-wrapper">
          <input
            id="password-input"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Digite sua senha"
            disabled={loading}
          />
          <span
            role="button"
            tabIndex={0}
            onClick={() => setShowPassword(!showPassword)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setShowPassword(!showPassword);
              }
            }}
            className="password-toggle"
            aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </span>
        </div>

        {error && (
          <p className="error-message">
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
