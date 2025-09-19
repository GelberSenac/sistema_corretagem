// src/componentes/Sidebar/Sidebar.jsx

import React from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  return (
    <aside className="sidebar">
      <nav>
        <ul>
          <li>
            <Link to="/">Dashboard</Link>
          </li>
          <li>
            <Link to="/usuarios">Gerenciar Usuários</Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
