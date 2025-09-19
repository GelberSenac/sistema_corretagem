import React from "react";
import "./Header.css";

function Header({ onLogout }) {
  return (
    <header>
      <h1>Meu Sistema de Gerenciamento</h1>
      <nav className="header-nav">
        <a href="#" onClick={onLogout}>
          Sair
        </a>
      </nav>
    </header>
  );
}

export default Header;
