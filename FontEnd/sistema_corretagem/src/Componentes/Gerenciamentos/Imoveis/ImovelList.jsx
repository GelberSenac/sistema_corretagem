import React from "react";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import "./Imoveis.css"; // Vamos usar o mesmo CSS de 'Imoveis.jsx'

function ImovelList({
  imoveis,
  loading,
  onEdit,
  onDelete,
  pagyInfo,
  onPageChange,
}) {
  // Componente reutilizável para os controlos de paginação
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

  // Função para formatar valores monetários
  const formatarValor = (valor) => {
    if (!valor) return "N/A";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  return (
    <div className="lista-container">
      <h2>Lista de Imóveis ({pagyInfo?.totalCount || 0} encontrados)</h2>

      <PaginationControls />

      {loading && <p>Atualizando lista de imóveis...</p>}

      <ul className="lista-grid-imoveis">
        {" "}
        {/* Usando uma classe específica para imóveis */}
        {imoveis.map((imovel) => (
          <li
            key={imovel.id}
            className={`imovel-card ${
              imovel.status !== "disponivel" ? "indisponivel" : ""
            }`}
          >
            {/* Adicionando a primeira foto do imóvel como imagem de capa do card */}
            {imovel.photos_urls && imovel.photos_urls.length > 0 && (
              <img
                src={imovel.photos_urls[0]}
                alt={imovel.nome_empreendimento}
                className="card-imagem-capa"
              />
            )}

            <Link to={`/imoveis/${imovel.id}`} className="card-link">
              <strong>{imovel.nome_empreendimento}</strong>
              <p className="card-bairro">
                {imovel.endereco?.bairro || "Bairro não informado"}
              </p>
              <p className="card-valor">{formatarValor(imovel.valor)}</p>
              <div className="card-detalhes-grid">
                <span>🛏️ {imovel.quartos}</span>
                <span>🛁 {imovel.banheiros}</span>
                <span>🚗 {imovel.vagas_garagem}</span>
                <span>▪️ {imovel.metragem} m²</span>
              </div>
            </Link>

            <div className="card-actions">
              <button onClick={() => onEdit(imovel)} title="Editar Rápido">
                <FaEdit />
              </button>
              <button
                onClick={() => onDelete(imovel.id)}
                title="Excluir Imóvel"
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

export default ImovelList;
