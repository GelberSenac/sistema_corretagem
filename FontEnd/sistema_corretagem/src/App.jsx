// src/App.jsx

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./Contextos/AuthContexto";

// Importação das páginas e componentes de layout
import Dashboard from "./componentes/Dashboard/Dashboard";
import Usuarios from "./componentes/Gerenciamentos/Usuarios/Usuarios";
import UsuarioDetalhesPage from "./componentes/Gerenciamentos/Usuarios/UsuarioDetalhesPage";
import Clientes from "./componentes/Gerenciamentos/Clientes/Clientes";
import ClienteDetalhesPage from "./componentes/Gerenciamentos/Clientes/ClienteDetalhesPage";
import PerfisBuscaPage from "./componentes/Gerenciamentos/PerfisBusca/PerfisBuscaPage";
import Imoveis from "./componentes/Gerenciamentos/Imoveis/Imoveis"; // LINHA ADICIONADA
import ImovelDetalhesPage from "./componentes/Gerenciamentos/Imoveis/ImovelDetalhesPage";
import NovaProposta from "./componentes/Propostas/NovaProposta"; // Adicione também, se faltar
import Login from "./componentes/Login/Login";
import Sidebar from "./componentes/Sidebar/Sidebar";
import Header from "./componentes/Header/Header";
import Footer from "./componentes/Footer/Footer";
import "./App.css";

// --- Componentes Auxiliares ---

// 1. Componente para proteger rotas que exigem login
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  // Se o usuário estiver autenticado, renderiza a página. Se não, redireciona para o login.
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// 2. Componente de Layout Principal (Header, Sidebar, Footer)
const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  return (
    <div className="app-container">
      <Header onLogout={logout} />
      <div className="main-content">
        <Sidebar userRole={user?.role} />
        <main className="content">{children}</main>
      </div>
      <Footer />
    </div>
  );
};

// --- Componente Principal da Aplicação ---

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Rota pública de Login */}
        <Route
          path="/login"
          // Se o usuário já estiver logado, ele é redirecionado para o Dashboard
          element={!isAuthenticated ? <Login /> : <Navigate to="/" />}
        />

        {/* Agrupamento de todas as rotas protegidas */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <MainLayout>
                {/* Rotas aninhadas que serão exibidas dentro do MainLayout */}
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/usuarios" element={<Usuarios />} />
                  <Route
                    path="/usuarios/:id"
                    element={<UsuarioDetalhesPage />}
                  />
                  <Route path="/clientes" element={<Clientes />} />
                  <Route
                    path="/clientes/:clienteId"
                    element={<ClienteDetalhesPage />}
                  />
                  <Route
                    path="/clientes/:clienteId/perfis"
                    element={<PerfisBuscaPage />}
                  />
                  <Route path="/imoveis" element={<Imoveis />} />
                  <Route path="/imoveis/:id" element={<ImovelDetalhesPage />} />
                  <Route path="/propostas/nova" element={<NovaProposta />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </MainLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
