// src/componentes/Gerenciamentos/Usuarios/UsuarioList.jsx

import React from "react";
// 1. Importar o Link
import { Link } from "react-router-dom";
import { FaEdit, FaUserSlash } from "react-icons/fa";

function UsuarioList({ usuarios, currentUser, onEdit, onDelete }) {
  return (
    <div>
      <h2>Lista de Usuários</h2>
      <ul className="lista-grid">
        {usuarios.map((usuario) => (
          <li
            key={usuario.id}
            className={`usuario-card ${!usuario.ativo ? "inativo" : ""}`}
          >
            {/* 2. Envolver o conteúdo principal com o Link */}
            <Link to={`/usuarios/${usuario.id}`} className="card-link">
              <strong>{usuario.nome}</strong> - {usuario.email}
              <p>Status: {usuario.ativo ? "Ativo" : "Inativo"}</p>
              <p>Papel: {usuario.role}</p>
            </Link>

            {/* As ações rápidas continuam separadas, fora do link */}
            {currentUser?.role === "admin" &&
              currentUser?.id !== usuario.id && (
                <div className="user-actions">
                  <button
                    onClick={() => onEdit(usuario)}
                    title="Editar na lista"
                  >
                    <FaEdit />
                  </button>
                  {usuario.ativo && (
                    <button
                      onClick={() => onDelete(usuario.id)}
                      title="Inativar Usuário"
                    >
                      <FaUserSlash />
                    </button>
                  )}
                </div>
              )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UsuarioList;
