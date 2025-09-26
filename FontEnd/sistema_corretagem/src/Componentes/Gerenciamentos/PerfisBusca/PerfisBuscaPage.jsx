// src/componentes/Gerenciamentos/PerfisBusca/PerfisBuscaPage.jsx

import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import PerfisBusca from "./PerfisBusca"; // Importa nosso componente de gerenciamento

function PerfisBuscaPage() {
  const { clienteId } = useParams(); // Pega o ID do cliente da URL
  const navigate = useNavigate();

  return (
    <div className="detalhes-container">
      <button
        onClick={() => navigate(`/clientes/${clienteId}`)}
        className="back-button"
      >
        &larr; Voltar para o Perfil do Cliente
      </button>

      <hr />

      {/* Renderiza o componente de gerenciamento, passando o ID do cliente */}
      <PerfisBusca clienteId={clienteId} />
    </div>
  );
}

export default PerfisBuscaPage;
