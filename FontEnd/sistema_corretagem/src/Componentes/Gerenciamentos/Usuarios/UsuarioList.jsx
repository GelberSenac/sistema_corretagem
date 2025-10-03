// src/componentes/Gerenciamentos/Usuarios/UsuarioList.jsx

import React from "react";
import { Link } from "react-router-dom";
import { FaEdit, FaUserSlash } from "react-icons/fa";

function UsuarioList({
  usuarios,
  currentUser,
  onEdit,
  onDelete,
  pagyInfo,
  onPageChange,
  loading,
}) {
  const PaginationControls = () => {
    if (!pagyInfo || pagyInfo.totalPages <= 1) return null;
    return (
      <div className="pagination-controls">
        <button
          onClick={() => onPageChange(pagyInfo.currentPage - 1)}
          disabled={pagyInfo.currentPage === 1 || loading}
        >
          &larr; Anterior
        </button>
        <span>
          {" "}
          Página {pagyInfo.currentPage} de {pagyInfo.totalPages}{" "}
        </span>
        <button
          onClick={() => onPageChange(pagyInfo.currentPage + 1)}
          disabled={pagyInfo.currentPage === pagyInfo.totalPages || loading}
        >
          Próxima &rarr;
        </button>
      </div>
    );
  };

  return (
    <div>
      <h2>Lista de Usuários</h2>
      <PaginationControls />
      {loading && <p>Atualizando lista...</p>}
      <ul className="lista-grid">
        {usuarios.map((usuario) => (
          <li
            key={usuario.id}
            className={`usuario-card ${!usuario.ativo ? "inativo" : ""}`}
          >
            <Link to={`/usuarios/${usuario.id}`} className="card-link">
              <strong>{usuario.nome}</strong> - {usuario.email}
              <p>Status: {usuario.ativo ? "Ativo" : "Inativo"}</p>
              <p>Papel: {usuario.role}</p>
            </Link>

            {currentUser?.role === "admin" &&
              currentUser?.id !== usuario.id && (
                <div className="card-actions">
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
      <PaginationControls />
    </div>
  );
}

export default UsuarioList;
