// src/componentes/Footer/Footer.jsx

import React from "react";
import "./Footer.css";

function Footer() {
  // Pega o ano atual dinamicamente
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <p>
        &copy; {currentYear} Sistema de Gerenciamento. Todos os direitos
        reservados.
      </p>
    </footer>
  );
}

export default Footer;
