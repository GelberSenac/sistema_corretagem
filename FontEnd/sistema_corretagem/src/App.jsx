// src/App.jsx

import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GerenciamentoUsuarios from "./componentes/GerenciamentoUsuario/GerenciamentoUsuarios";
// Importe o novo componente Dashboard
import Dashboard from "./componentes/Dashboard/Dashboard";
import Sidebar from "./componentes/Sidebar/Sidebar";
import Header from "./componentes/Header/Header";
import Footer from "./componentes/Footer/Footer";
import Login from "./componentes/Login/Login";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      <BrowserRouter>
        <Header onLogout={handleLogout} />
        <div className="main-content">
          <Sidebar />
          <main className="content">
            <Routes>
              {/* Rota para o Dashboard na tela inicial */}
              <Route path="/" element={<Dashboard />} />
              {/* Rota para o gerenciamento de usuários */}
              <Route path="/usuarios" element={<GerenciamentoUsuarios />} />
            </Routes>
          </main>
        </div>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
