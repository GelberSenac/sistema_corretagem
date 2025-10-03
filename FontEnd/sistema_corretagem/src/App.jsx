// src/App.jsx

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./Contextos/AuthContexto";

// Importação das páginas e componentes de layout
import Dashboard from "./Componentes/Dashboard/Dashboard";
import Usuarios from "./Componentes/Gerenciamentos/Usuarios/Usuarios";
import UsuarioDetalhesPage from "./Componentes/Gerenciamentos/Usuarios/UsuarioDetalhesPage";
import Clientes from "./Componentes/Gerenciamentos/Clientes/Clientes";
import ClienteDetalhesPage from "./Componentes/Gerenciamentos/Clientes/ClienteDetalhesPage";
import PerfisBuscaPage from "./Componentes/Gerenciamentos/PerfisBusca/PerfisBuscaPage";
import Imoveis from "./Componentes/Gerenciamentos/Imoveis/Imoveis"; // LINHA ADICIONADA
import ImovelDetalhesPage from "./Componentes/Gerenciamentos/Imoveis/ImovelDetalhesPage";
import NovaProposta from "./Componentes/Propostas/NovaProposta"; // Adicione também, se faltar
import Agenda from "./Componentes/Agenda/Agenda"; // Importa o novo componente
import Financeiro from "./Componentes/Financeiro/Financeiro";
import Relatorios from "./Componentes/Relatorios/Relatorios";
import Login from "./Componentes/Login/Login";
import Sidebar from "./Componentes/Sidebar/Sidebar";
import Header from "./Componentes/Header/Header";
import Footer from "./Componentes/Footer/Footer";
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
                  <Route path="/agenda" element={<Agenda />} /> {/* Adiciona a nova rota */}
                  <Route path="/financeiro" element={<Financeiro />} />
                  <Route path="/relatorios" element={<Relatorios />} />
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
