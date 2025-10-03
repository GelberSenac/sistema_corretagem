// src/componentes/Header/Header.jsx
import React from "react";
import "./Header.css";
import { useAuth } from "../../Contextos/AuthContexto";

function Header() {
  // 1. Pegamos também o 'user' do nosso contexto de autenticação.
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="header-content">
        {/* 2. Exibimos uma saudação para o usuário. 
            O 'user?.nome' usa optional chaining para não quebrar se o 'user' for nulo. */}
        {user && <span className="user-greeting">Olá, {user.nome}</span>}

        {/* 3. Usamos a tag <button> para a ação de logout. */}
        <button onClick={logout} className="logout-button">
          Sair
        </button>
      </div>
    </header>
  );
}

export default Header;
