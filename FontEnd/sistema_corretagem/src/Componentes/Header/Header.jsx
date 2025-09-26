import React from "react";
import "./Header.css";

import { useAuth } from "../../Contextos/AuthContexto"; // Verifique o caminho

function Header() {
  const { logout } = useAuth();
  return (
    <header>
      <a href="#" onClick={logout}>
        Sair
      </a>
    </header>
  );
}

export default Header;
