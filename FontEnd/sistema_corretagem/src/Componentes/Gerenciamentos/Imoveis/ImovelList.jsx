import React from "react";
import { Link } from "react-router-dom"; // Importe o Link
import { FaEdit, FaTrash } from "react-icons/fa";

function ImovelList({ imoveis, onEdit, onDelete }) {
  return (
    <div>
      <h2>Lista de Imóveis</h2>
      <ul className="lista-grid">
        {imoveis.map((imovel) => (
          <li key={imovel.id} className="imovel-card">
            <Link to={`/imoveis/${imovel.id}`}>
              {" "}
              {/* Link para a página de detalhes */}
              {imovel.photos_urls && imovel.photos_urls.length > 0 ? (
                <img
                  src={imovel.photos_urls[0]}
                  alt={imovel.nome_empreendimento}
                  style={{ width: "100%", height: "180px", objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "180px",
                    backgroundColor: "#e9ecef",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#6c757d",
                  }}
                >
                  Sem Foto
                </div>
              )}
            </Link>
            <div className="imovel-card-content">
              <strong>{imovel.nome_empreendimento}</strong>
              <p>
                Valor: R${" "}
                {Number(imovel.valor).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
              <p>Bairro: {imovel.endereco?.bairro || "N/A"}</p>{" "}
              {/* Exemplo de como acessar dados do endereço */}
              <p>Quartos: {imovel.quartos}</p>
            </div>
            <div className="user-actions">
              <button onClick={() => onEdit(imovel)}>
                <FaEdit />
              </button>
              <button onClick={() => onDelete(imovel.id)}>
                <FaTrash />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ImovelList;
