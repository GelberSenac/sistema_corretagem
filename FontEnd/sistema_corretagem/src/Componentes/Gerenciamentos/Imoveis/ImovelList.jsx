import React from "react";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import "./Imoveis.css"; // Vamos usar o mesmo CSS de 'Imoveis.jsx'
import { formatCurrencyBR } from "../../Shared/CurrencyInput";

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
    if (valor === null || valor === undefined) return "N/A";
    return formatCurrencyBR(valor);
  };

  return (
    <div className="lista-container">
      <h2>Lista de Imóveis ({pagyInfo?.totalCount ?? imoveis.length} encontrados)</h2>

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
            {/* Substituído por carrossel de fotos do imóvel */}
            <CardCarousel
              images={
                (imovel.photos_thumb_urls && imovel.photos_thumb_urls.length > 0
                  ? imovel.photos_thumb_urls
                  : imovel.photos_urls) || []
              }
              alt={imovel.nome_empreendimento}
            />
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

// Pequeno carrossel para exibir múltiplas fotos no card
function CardCarousel({ images = [], autoPlay = true, interval = 3000, alt = "" }) {
  const [index, setIndex] = React.useState(0);
  const validImages = Array.isArray(images) ? images.filter(Boolean) : [];

  React.useEffect(() => {
    if (!autoPlay || validImages.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % validImages.length), interval);
    return () => clearInterval(id);
  }, [autoPlay, interval, validImages.length]);

  if (validImages.length === 0) return null;

  const prev = () => setIndex((i) => (i - 1 + validImages.length) % validImages.length);
  const next = () => setIndex((i) => (i + 1) % validImages.length);

  return (
    <div className="card-carousel">
      <img src={validImages[index]} alt={alt} className="card-carousel-image" />
      {validImages.length > 1 && (
        <>
          <button className="carousel-arrow left" onClick={prev} aria-label="Anterior">‹</button>
          <button className="carousel-arrow right" onClick={next} aria-label="Próxima">›</button>
          <div className="carousel-dots">
            {validImages.map((_, i) => (
              <span
                key={i}
                className={`carousel-dot ${index === i ? "active" : ""}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
