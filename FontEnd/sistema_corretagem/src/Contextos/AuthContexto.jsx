// src/contexts/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from "react";
import apiClient from "../Servicos/Api"; // Importamos nosso cliente API

// 1. Cria o Contexto
const AuthContext = createContext();

// 2. Cria o Provedor do Contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("authToken"));
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("authToken"),
  );

  // Efeito para configurar o token no axios quando o app carrega
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
      // Configura o token em todas as futuras requisições do axios
      apiClient.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${storedToken}`;
    }
  }, []);

  // Função de login que será chamada pelo componente Login
  const login = (userData, authToken) => {
    localStorage.setItem("authToken", authToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setToken(authToken);
    setIsAuthenticated(true);
    // Configura o token para as próximas requisições
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
  };

  // Função de logout
  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    delete apiClient.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Cria um hook customizado para usar o contexto facilmente
export const useAuth = () => {
  return useContext(AuthContext);
};
