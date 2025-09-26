// src/componentes/Sidebar/Sidebar.jsx

import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../Contextos/AuthContexto";
import "./Sidebar.css";

function Sidebar() {
  const { user } = useAuth();

  const isAdmin = user?.role === "admin";
  const isCorretor = user?.role === "corretor";

  return (
    <aside className="sidebar">
      <nav>
        <ul>
          <li>
            <Link to="/">Dashboard</Link>
          </li>

          {/* Apenas o Admin pode ver */}
          {isAdmin && (
            <li>
              <Link to="/usuarios">Gerenciar Usuários</Link>
            </li>
          )}

          {/* Links visíveis para Admin E Corretor */}
          {(isAdmin || isCorretor) && (
            <>
              <li>
                <Link to="/clientes">Gerenciar Clientes</Link>
              </li>
              <li>
                <Link to="/imoveis">Gerenciar Imóveis</Link>
              </li>
              <li>
                <Link to="/propostas/nova">Nova Proposta</Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
