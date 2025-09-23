// src/componentes/Sidebar/Sidebar.jsx

import React from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";
import Usuarios from "../Gerenciamentos/Usuarios/Usuarios";
import Clientes from "../Gerenciamentos/Clientes/Clientes";
import Dashboard from "../Dashboard/Dashboard";

function Sidebar({ userRole }) {
  const canSeeGerenciamentoUsuarios =
    userRole === "admin" || userRole === "corretor";
  const canSeeGerenciamentoClientes =
    userRole === "admin" || userRole === "corretor";

  return (
    <aside className="sidebar">
      <nav>
        <ul>
          <li>
            <Link to="/">Dashboard</Link>
          </li>
          {canSeeGerenciamentoUsuarios && (
            <li>
              {/* Mude o nome do componente */}
              <Link to="/usuarios">Gerenciar Usuários</Link>
            </li>
          )}
          {canSeeGerenciamentoClientes && (
            <li>
              {/* Mude o nome do componente */}
              <Link to="/clientes">Gerenciar Clientes</Link>
            </li>
          )}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
