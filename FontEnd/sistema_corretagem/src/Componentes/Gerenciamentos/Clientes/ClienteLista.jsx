// src/componentes/Gerenciamentos/Clientes/ClienteLista.jsx

import React from "react";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";

function ClienteLista({
  clientes,
  loading,
  onEdit,
  onDelete,
  pagyInfo,
  onPageChange,
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
          Página {pagyInfo.currentPage} de {pagyInfo.totalPages}
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
      <h2>Lista de Clientes</h2>

      <PaginationControls />

      {loading && <p>Atualizando lista...</p>}

      <ul className="lista-grid">
        {clientes.map((cliente) => (
          <li key={cliente.id} className="cliente-card">
            <Link to={`/clientes/${cliente.id}`} className="card-link">
              <strong>{cliente.nome}</strong>
              <p>Email: {cliente.email}</p>
              <p>Telefone: {cliente.telefone}</p>
              <p>CPF: {cliente.cpf}</p>
            </Link>
            <div className="card-actions">
              <button onClick={() => onEdit(cliente)} title="Editar Rápido">
                <FaEdit />
              </button>
              <button
                onClick={() => onDelete(cliente.id)}
                title="Excluir Cliente"
              >
                <FaTrash />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <PaginationControls />
    </div>
  );
}

export default ClienteLista;
