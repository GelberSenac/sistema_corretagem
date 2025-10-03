// src/componentes/Sidebar/Sidebar.jsx

import React from "react";
// 1. Importamos o 'NavLink' em vez do 'Link'
import { NavLink } from "react-router-dom";
import { useAuth } from "../../Contextos/AuthContexto";
import "./Sidebar.css";

function Sidebar() {
  const { user } = useAuth();

  const isAdmin = user?.role === "admin";
  const isCorretor = user?.role === "corretor";

  // Função para definir a classe do link (ativo ou não)
  const getNavLinkClass = ({ isActive }) =>
    isActive ? "sidebar-link active" : "sidebar-link";

  return (
    <aside className="sidebar">
      <nav>
        <ul>
          <li>
            {/* 2. Usamos NavLink e a função de classe em todos os links */}
            <NavLink to="/" className={getNavLinkClass}>
              Dashboard
            </NavLink>
          </li>

          {/* Apenas o Admin pode ver */}
          {isAdmin && (
            <li>
              <NavLink to="/usuarios" className={getNavLinkClass}>
                Gerenciar Usuários
              </NavLink>
            </li>
          )}

          {/* Links visíveis para Admin E Corretor */}
          {(isAdmin || isCorretor) && (
            <>
              <li>
                <NavLink to="/clientes" className={getNavLinkClass}>
                  Gerenciar Clientes
                </NavLink>
              </li>
              <li>
                <NavLink to="/imoveis" className={getNavLinkClass}>
                  Gerenciar Imóveis
                </NavLink>
              </li>
              <li>
                <NavLink to="/propostas/nova" className={getNavLinkClass}>
                  Nova Proposta
                </NavLink>
              </li>
              <li>
                <NavLink to="/agenda" className={getNavLinkClass}>
                  Agenda
                </NavLink>
              </li>
              <li>
                <NavLink to="/financeiro" className={getNavLinkClass}>
                  Financeiro
                </NavLink>
              </li>
              <li>
                <NavLink to="/relatorios" className={getNavLinkClass}>
                  Relatórios
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
