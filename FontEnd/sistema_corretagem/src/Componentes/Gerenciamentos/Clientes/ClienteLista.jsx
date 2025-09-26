import React from "react";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";

function ClienteList({ clientes, onEdit, onDelete }) {
  return (
    <div>
      <h2>Lista de Clientes</h2>
      <ul className="lista-grid">
        {clientes.map((cliente) => (
          <li key={cliente.id} className="cliente-card">
            <Link to={`/clientes/${cliente.id}`} className="card-link">
              <strong>{cliente.nome}</strong>
              <p>Email: {cliente.email}</p>
              <p>Telefone: {cliente.telefone}</p>
              <p>CPF: {cliente.cpf}</p>
            </Link>
            <div className="user-actions">
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
    </div>
  );
}

export default ClienteList;
