// src/componentes/Gerenciamentos/Imoveis/ImovelDetalhesPage.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom"; // 1. Adiciona o Link
import { getImovelById } from "../../../Servicos/Api";
import { toast, Toaster } from "react-hot-toast";

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { formatCurrencyBR } from "../../Shared/CurrencyInput";
import "./Imoveis.css"; // Reutilize e adicione estilos aqui

// 2. Função auxiliar para formatar valores em Reais (BRL)
const formatarMoeda = (valor) => {
  if (valor === null || valor === undefined) return "N/A";
  return formatCurrencyBR(valor);
};

function ImovelDetalhesPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [imovel, setImovel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  useEffect(() => {
    /* ... sua lógica de fetch continua a mesma ... */
  }, [id]);

  if (loading) return <h1>Carregando imóvel...</h1>;
  if (!imovel) return <h1>Imóvel não encontrado.</h1>;

  const slides = imovel.photos_urls?.map((url) => ({ src: url })) || [];

  return (
    <div className="detalhes-container">
      <Toaster />
      <button onClick={() => navigate("/imoveis")} className="back-button">
        &larr; Voltar para a lista de imóveis
      </button>

      {/* --- CABEÇALHO --- */}
      <div className="detalhes-header-card">
        <h2>{imovel.nome_empreendimento}</h2>
        <p className="detalhes-bairro">{`${imovel.endereco?.bairro}, ${imovel.endereco?.cidade}`}</p>
        <div className="detalhes-valor-principal">
          {formatarMoeda(imovel.valor)}
        </div>
      </div>

      {/* --- FOTOS E AÇÃO PRINCIPAL --- */}
      <div className="imovel-detalhes-grid-principal">
        <div
          className="imovel-fotos"
          onClick={() => slides.length > 0 && setIsGalleryOpen(true)}
          style={{ cursor: slides.length > 0 ? "pointer" : "default" }}
        >
          <h3>Galeria de Fotos</h3>
          {slides.length > 0 ? (
            <img
              src={slides[0].src}
              alt="Foto principal do imóvel"
              className="foto-principal"
            />
          ) : (
            <div className="sem-foto-detalhe">Sem Fotos</div>
          )}
          <p className="galeria-aviso">
            {slides.length} fotos disponíveis. Clique na imagem para ampliar.
          </p>
        </div>

        {/* 3. CHAMADA PARA AÇÃO (Call to Action) */}
        <div className="info-card cta-card">
          <h3>Interessado neste imóvel?</h3>
          <p>
            O próximo passo é enviar uma proposta. Clique no botão abaixo para
            iniciar o processo.
          </p>
          {/* O Link passa o objeto 'imovel' para a página de nova proposta */}
          <Link
            to="/propostas/nova"
            state={{ imovel: imovel }}
            className="cta-button"
          >
            Fazer Proposta
          </Link>
          <hr />
          <h4>Corretor Responsável</h4>
          <p>{imovel.corretor?.nome || "Não informado"}</p>
        </div>
      </div>

      <hr className="section-divider" />

      {/* --- GRID DE INFORMAÇÕES DETALHADAS --- */}
      <h3>Detalhes do Imóvel</h3>
      <div className="detalhes-grid">
        <div className="info-card">
          <h4>Estrutura</h4>
          <p>
            <strong>Tipo:</strong> {imovel.tipo}
          </p>
          <p>
            <strong>Quartos:</strong> {imovel.quartos}
          </p>
          <p>
            <strong>Suítes:</strong> {imovel.suites}
          </p>
          <p>
            <strong>Banheiros:</strong> {imovel.banheiros}
          </p>
          <p>
            <strong>Vagas de Garagem:</strong> {imovel.vagas_garagem}
          </p>
          <p>
            <strong>Metragem:</strong> {imovel.metragem} m²
          </p>
          <p>
            <strong>Posição Solar:</strong> {imovel.posicao_solar}
          </p>
          <p>
            <strong>Ano de Construção:</strong> {imovel.ano_construcao}
          </p>
        </div>

        <div className="info-card">
          <h4>Valores e Taxas</h4>
          <p>
            <strong>Valor de Venda:</strong> {formatarMoeda(imovel.valor)}
          </p>
          <p>
            <strong>Condomínio:</strong>{" "}
            {formatarMoeda(imovel.valor_condominio)}
          </p>
          <p>
            <strong>IPTU:</strong> {formatarMoeda(imovel.valor_iptu)}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span className={`status-${imovel.status}`}>
              {imovel.status.replace("_", " ")}
            </span>
          </p>
        </div>

        {imovel.caracteristicas && imovel.caracteristicas.length > 0 && (
          <div className="info-card grid-col-span-2">
            <h4>Características e Comodidades</h4>
            <ul className="lista-caracteristicas">
              {imovel.caracteristicas.map((c) => (
                <li key={c.id}>✓ {c.nome}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Componente da Galeria (Lightbox) */}
      <Lightbox
        open={isGalleryOpen}
        close={() => setIsGalleryOpen(false)}
        slides={slides}
        plugins={[Zoom, Thumbnails]}
      />
    </div>
  );
}

export default ImovelDetalhesPage;
