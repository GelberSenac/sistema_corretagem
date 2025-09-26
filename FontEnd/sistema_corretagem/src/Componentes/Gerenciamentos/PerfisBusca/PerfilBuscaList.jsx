import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

function PerfilBuscaList({ perfis, onEdit, onDelete }) {
  if (perfis.length === 0) {
    return <p>Nenhum perfil de busca cadastrado para este cliente.</p>;
  }

  return (
    <div>
      <h3>Perfis de Busca Salvos</h3>
      <ul className="lista-grid">
        {perfis.map((perfil) => (
          <li key={perfil.id} className="cliente-card">
            {" "}
            {/* Pode reutilizar o estilo do card de cliente */}
            <div>
              <strong>{perfil.titulo_busca}</strong>
              <p>
                Busca por: {perfil.tipo_negocio} até R${" "}
                {perfil.valor_maximo_imovel}
              </p>
            </div>
            <div className="user-actions">
              <button onClick={() => onEdit(perfil)}>
                <FaEdit />
              </button>
              <button onClick={() => onDelete(perfil.id)}>
                <FaTrash />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PerfilBuscaList;
