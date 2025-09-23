// src/App.jsx

import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// Mude a importação e o nome do componente
import Usuarios from "./componentes/Gerenciamentos/Usuarios/Usuarios";
import Clientes from "./componentes/Gerenciamentos/Clientes/Clientes";
import Dashboard from "./componentes/Dashboard/Dashboard";
import Sidebar from "./componentes/Sidebar/Sidebar";
import Header from "./componentes/Header/Header";
import Footer from "./componentes/Footer/Footer";
import Login from "./componentes/Login/Login";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const handleLoginSuccess = (role) => {
    setIsLoggedIn(true);
    setUserRole(role);
  };
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
  };
  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }
  return (
    <div className="app-container">
      <BrowserRouter>
        <Header onLogout={handleLogout} />
        <div className="main-content">
          <Sidebar userRole={userRole} />
          <main className="content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              {/* Mude o nome do componente e adicione a prop */}
              <Route
                path="/usuarios"
                element={<Usuarios userRole={userRole} />}
              />
              <Route
                path="/clientes"
                element={<Clientes userRole={userRole} />}
              />
            </Routes>
          </main>
        </div>
        <Footer />
      </BrowserRouter>
    </div>
  );
}
export default App;
