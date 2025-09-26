import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getImovelById } from "../../../Servicos/Api";
import { toast, Toaster } from "react-hot-toast";

// Importando a galeria (lightbox)
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

// Opcional: Importando plugins para a galeria (zoom, thumbnails)
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";

function ImovelDetalhesPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [imovel, setImovel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false); // Estado para controlar a galeria

  useEffect(() => {
    const fetchImovel = async () => {
      try {
        const response = await getImovelById(id);
        setImovel(response.data);
      } catch (error) {
        toast.error("Não foi possível carregar os dados do imóvel.");
      } finally {
        setLoading(false);
      }
    };
    fetchImovel();
  }, [id]);

  if (loading) return <h1>Carregando imóvel...</h1>;
  if (!imovel) return <h1>Imóvel não encontrado.</h1>;

  // Prepara as imagens para o formato que a galeria espera
  const slides = imovel.photos_urls?.map((url) => ({ src: url })) || [];

  return (
    <div className="detalhes-container">
      {" "}
      {/* Pode reutilizar o CSS da outra página de detalhes */}
      <Toaster />
      <button onClick={() => navigate("/imoveis")} className="back-button">
        &larr; Voltar para a lista de imóveis
      </button>
      <h2>{imovel.nome_empreendimento}</h2>
      <div className="imovel-detalhes-grid">
        <div className="imovel-fotos">
          <h3>Fotos</h3>
          {slides.length > 0 ? (
            // Ao clicar na imagem principal, abre a galeria
            <img
              src={slides[0].src}
              alt="Foto principal do imóvel"
              className="foto-principal"
              onClick={() => setIsGalleryOpen(true)}
              style={{ cursor: "pointer" }}
            />
          ) : (
            <div className="sem-foto-detalhe">Sem Fotos</div>
          )}
          <p>
            {slides.length} fotos disponíveis. Clique na imagem para ver a
            galeria.
          </p>
        </div>

        <div className="imovel-info">
          <h3>Informações Principais</h3>
          <p>
            <strong>Valor:</strong> R${" "}
            {Number(imovel.valor).toLocaleString("pt-BR")}
          </p>
          <p>
            <strong>Bairro:</strong> {imovel.endereco?.bairro}
          </p>
          <p>
            <strong>Quartos:</strong> {imovel.quartos}
          </p>
          <p>
            <strong>Suítes:</strong> {imovel.suites}
          </p>
          <p>
            <strong>Vagas:</strong> {imovel.vagas_garagem}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span className={`status-${imovel.status}`}>{imovel.status}</span>
          </p>
          {/* Adicione outras informações aqui */}
        </div>
      </div>
      {/* Componente da Galeria (Lightbox) */}
      <Lightbox
        open={isGalleryOpen}
        close={() => setIsGalleryOpen(false)}
        slides={slides}
        plugins={[Zoom, Thumbnails]} // Habilita zoom e miniaturas
      />
    </div>
  );
}

export default ImovelDetalhesPage;
