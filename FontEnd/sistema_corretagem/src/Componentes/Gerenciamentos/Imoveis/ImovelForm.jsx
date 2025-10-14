// src/componentes/Gerenciamentos/Imoveis/ImovelForm.jsx

import React, { useState, useEffect, useRef } from "react";
import AddressForm from "../../Shared/AddressForm";
import ConfirmModal from "../../Shared/ConfirmModal";
import CurrencyInput from "../../Shared/CurrencyInput";
import { createImovel, updateImovel } from "../../../Servicos/Api";

// Estado inicial completo e alinhado com o backend
const initialState = {
  nome_empreendimento: "",
  tipo: "apartamento",
  finalidade: "venda",
  condicao: "usado",
  posicao_solar: "",
  descricao: "",
  quartos: 0,
  suites: 0,
  banheiros: 0,
  vagas_garagem: 0,
  metragem: 0,
  ano_construcao: "",
  valor: "",
  valor_condominio: "",
  valor_iptu: "",
  status: "disponivel",
  endereco_attributes: {
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
  },
  comodo_attributes: {
    area_de_servico: false,
    cozinha: false,
    sala_de_estar: false,
    sala_de_jantar: false,
    suite: false,
    varanda: false,
    wc_social: false,
    wc_de_servico: false,
    despensa: false,
    quarto_de_servico: false,
    sala_de_visita: false,
    banheiro_social: false,
    lavabo: false,
    escritorio: false,
    home_office: false,
    closet: false,
    hall: false,
    sala_de_tv: false,
    terraco: false,
  },
  infraestrutura_attributes: {
    garagem: false,
    lavanderia: false,
    jardim_interno: false,
    jardim_externo: false,
    piscina: false,
    playground: false,
    portaria_24h: false,
    salao_de_festas: false,
    sistema_de_seguranca: false,
    churrasqueira: false,
    elevador: false,
    sauna: false,
    quadra_poliesportiva: false,
    academia: false,
    campo_de_futebol: false,
    bicicletario: false,
    area_de_lazer: false,
    central_de_gas: false,
    portao_eletronico: false,
    gerador: false,
    interfone: false,
    guarita: false,
    monitoramento: false,
    cftv: false,
    brinquedoteca: false,
    salao_de_jogos: false,
    spa: false,
    coworking: false,
    pet_place: false,
    car_wash: false,
    mini_mercado: false,
    estacionamento_visitantes: false,
  },
  piso_attributes: {
    porcelanato: false,
    ceramica: false,
    granito: false,
    laminado: false,
    madeira: false,
    vinilico: false,
    carpete: false,
    ardosia: false,
    marmore: false,
    taco: false,
  },
  posicao_attributes: {
    nascente: false,
    vista_para_o_mar: false,
    beira_mar: false,
    poente: false,
    frente_para_o_mar: false,
    norte: false,
    sul: false,
    leste: false,
    oeste: false,
  },
  proximidade_attributes: {
    bares_e_restaurantes: false,
    escola: false,
    faculdade: false,
    farmacia: false,
    hospital: false,
    padaria: false,
    pet_shop: false,
    shopping_center: false,
    supermercado: false,
    banco: false,
    shopping: false,
    praia: false,
    parque: false,
    metro: false,
    estacao_de_metro: false,
    estacao: false,
    ponto_de_onibus: false,
    terminal: false,
    igreja: false,
    feira: false,
    mercado: false,
    posto_de_gasolina: false,
    delegacia: false,
    correios: false,
    loterica: false,
    universidade: false,
    creche: false,
  },
};

function ImovelForm({
  imovelSendoEditado,
  onFormSubmit,
  onCancelEdit,
  resetSignal,
}) {
  const [formData, setFormData] = useState(initialState);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [fileErrors, setFileErrors] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const firstFieldRef = useRef(null);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [existingPhotosUrls, setExistingPhotosUrls] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]); // {id, url, thumb_url}
  const [removePhotoIds, setRemovePhotoIds] = useState([]);

  // Coerção segura para valores monetários vindos da API
  const coerceCurrencyValue = (v) => {
    if (v === null || v === undefined || v === "") return "";
    if (typeof v === "number") return v;
    const s = String(v).trim();

    // Formato brasileiro (ex.: 259.900,00) -> remove pontos de milhar e substitui vírgula por ponto
    if (s.includes(",")) {
      const normalized = s.replace(/\./g, "").replace(",", ".");
      const n = parseFloat(normalized);
      return isNaN(n) ? "" : n;
    }

    // Detecta pontos como separador de milhar (ex.: 2.590.000) sem decimais
    const thousandsDotPattern = /^\d{1,3}(\.\d{3})+$/;
    if (thousandsDotPattern.test(s)) {
      const n = parseFloat(s.replace(/\./g, ""));
      return isNaN(n) ? "" : n;
    }

    // Formato padrão com ponto decimal (ex.: 259900.0)
    const n = parseFloat(s);
    return isNaN(n) ? "" : n;
  };

  useEffect(() => {
    if (imovelSendoEditado) {
      const dataFromApi = {
        ...initialState,
        ...imovelSendoEditado,
        endereco_attributes: imovelSendoEditado.endereco
          ? { ...imovelSendoEditado.endereco }
          : initialState.endereco_attributes,
        comodo_attributes: imovelSendoEditado.comodo
          ? { ...imovelSendoEditado.comodo }
          : initialState.comodo_attributes,
        infraestrutura_attributes: imovelSendoEditado.infraestrutura
          ? { ...imovelSendoEditado.infraestrutura }
          : initialState.infraestrutura_attributes,
        piso_attributes: imovelSendoEditado.piso
          ? { ...imovelSendoEditado.piso }
          : initialState.piso_attributes,
        posicao_attributes: imovelSendoEditado.posicao
          ? { ...imovelSendoEditado.posicao }
          : initialState.posicao_attributes,
        proximidade_attributes: imovelSendoEditado.proximidade
          ? { ...imovelSendoEditado.proximidade }
          : initialState.proximidade_attributes,
      };

      // Normaliza valores monetários para número
      dataFromApi.valor = coerceCurrencyValue(imovelSendoEditado.valor);
      dataFromApi.valor_condominio = coerceCurrencyValue(
        imovelSendoEditado.valor_condominio,
      );
      dataFromApi.valor_iptu = coerceCurrencyValue(imovelSendoEditado.valor_iptu);

      setFormData(dataFromApi);

      // Inicializa metadados de fotos existentes usando attachments do serializer
      const attachments = Array.isArray(imovelSendoEditado.photos_attachments)
        ? imovelSendoEditado.photos_attachments
        : [];
      // Apenas anexos com URL utilizável devem ser exibidos
      const displayAttachments = attachments.filter((a) => !!(a && (a.thumb_url || a.url)));
      setExistingPhotos(displayAttachments);
      // Resetar seleção de remoção ao reabrir edição
      setRemovePhotoIds([]);

      // Sincroniza URLs existentes (prefere thumb_url, senão url)
      const existing = displayAttachments.length > 0
        ? displayAttachments.map((a) => a.thumb_url || a.url).filter(Boolean)
        : (imovelSendoEditado.photos_thumb_urls?.length > 0
            ? imovelSendoEditado.photos_thumb_urls
            : imovelSendoEditado.photos_urls || []);
      setExistingPhotosUrls(existing);
    }
  }, [imovelSendoEditado]);

  // Resetar formulário quando o pai sinalizar (criação contínua)
  useEffect(() => {
    if (!imovelSendoEditado && resetSignal > 0) {
      setFormData(initialState);
      setSelectedFiles([]);
      setPreviewUrls((prev) => {
        prev.forEach((u) => URL.revokeObjectURL(u));
        return [];
      });
      setIsDirty(false);
      // Foco automático no primeiro campo após reset (apenas em criação)
      setTimeout(() => firstFieldRef.current?.focus(), 0);
    }
  }, [resetSignal, imovelSendoEditado]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [previewUrls]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    const keys = name.split(".");
    if (keys.length > 1) {
      setFormData((prev) => ({
        ...prev,
        [keys[0]]: { ...prev[keys[0]], [keys[1]]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setIsDirty(true);
  };

  const handleComodoChange = (e) => {
    const { name, checked } = e.target;
    const keys = name.split(".");
    setFormData((prev) => ({
      ...prev,
      [keys[0]]: { ...prev[keys[0]], [keys[1]]: checked },
    }));
    setIsDirty(true);
  };

  // Ajuste de limites e tipos permitidos (espelhando backend via .env)
  const MAX_SIZE_MB = Number(import.meta.env.VITE_MAX_UPLOAD_SIZE_MB ?? 8);
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
  const ALLOWED_IMAGE_TYPES = (import.meta.env.VITE_ALLOWED_IMAGE_TYPES ?? "image/jpeg,image/png,image/webp").split(",");
  const MAX_FILES = Number(import.meta.env.VITE_MAX_UPLOAD_FILES ?? 10);
  
  // Estado para progresso de upload por arquivo
  const [uploadProgress, setUploadProgress] = useState([]); // [{name,size,progress:0-100}]
  
  // Validação local de arquivos antes de adicionar
  const addFiles = (files) => {
    const newErrors = [];
    const valid = [];
    files.forEach((file) => {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        newErrors.push(`Tipo não permitido: ${file.type}. Permitidos: ${ALLOWED_IMAGE_TYPES.join(", ")}`);
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        newErrors.push(`Arquivo muito grande: ${(file.size / (1024 * 1024)).toFixed(1)}MB (máx ${MAX_SIZE_MB}MB)`);
        return;
      }
      valid.push(file);
    });
    if (newErrors.length > 0) setFileErrors((prev) => [...prev, ...newErrors]);
    if (valid.length === 0) return;
  
    setSelectedFiles((prev) => {
      const merged = [...prev, ...valid].slice(0, MAX_FILES);
      // inicializa progresso para novos arquivos
      setUploadProgress((progPrev) => {
        const existingNames = new Set(progPrev.map((p) => p.name + ":" + p.size));
        const added = merged
          .filter((f) => !existingNames.has(f.name + ":" + f.size))
          .map((f) => ({ name: f.name, size: f.size, progress: 0 }));
        return [...progPrev, ...added];
      });
      return merged;
    });
    // gerar pré-visualizações
    setPreviewUrls((prev) => {
      const previews = valid.map((f) => URL.createObjectURL(f));
      return [...prev, ...previews].slice(0, MAX_FILES);
    });
    setIsDirty(true);
  };
  
  // Handlers de drag & drop e seleção
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    addFiles(files);
  };
  
  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer?.files ?? []);
    if (files.length === 0) return;
    addFiles(files);
  };
  
  // Remover arquivo selecionado localmente
  const removeFileAt = (idx) => {
    setSelectedFiles((prev) => {
      const copy = [...prev];
      copy.splice(idx, 1);
      return copy;
    });
    setPreviewUrls((prev) => {
      const copy = [...prev];
      const url = copy[idx];
      if (url) URL.revokeObjectURL(url);
      copy.splice(idx, 1);
      return copy;
    });
    setUploadProgress((prev) => {
      const copy = [...prev];
      copy.splice(idx, 1);
      return copy;
    });
    setIsDirty(true);
  };
  
  // Marcar foto existente para remoção no backend (agora com alternância)
  const markPhotoForRemoval = (id) => {
    setRemovePhotoIds((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((x) => x !== id) : [...prev, id];
      console.log(exists ? "[Fotos] Desmarcou remoção" : "[Fotos] Marcou para remover", { id, marcadas: next });
      return next;
    });
    setIsDirty(true);
  };

  // Fechar formulário com confirmação
  const handleClose = () => {
    if (isDirty && !isSubmitting) {
      setIsCloseModalOpen(true);
      return;
    }
    onCancelEdit?.();
    setIsDirty(false);
  };
  
  // Exibir barras de progresso
  const handleSubmit = async (e, options = {}) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    const dataToSend = new FormData();
  
    Object.keys(formData).forEach((key) => {
      if (["endereco", "photos_urls", "corretor"].includes(key)) return;
      if (key === "endereco_attributes") {
        Object.keys(formData[key]).forEach((subKey) =>
          dataToSend.append(`imovel[${key}][${subKey}]`, formData[key][subKey] || ""),
        );
      } else if (
        [
          "comodo_attributes",
          "infraestrutura_attributes",
          "piso_attributes",
          "posicao_attributes",
          "proximidade_attributes",
        ].includes(key)
      ) {
        Object.keys(formData[key]).forEach((subKey) =>
          dataToSend.append(`imovel[${key}][${subKey}]`, formData[key][subKey] ? "true" : "false"),
        );
      } else {
        dataToSend.append(`imovel[${key}]`, formData[key] || "");
      }
    });
  
    // Incluir fotos novas com validação defensiva
    if (selectedFiles && selectedFiles.length > 0) {
      selectedFiles.forEach((file) => {
        // defesa extra (espelhando backend):
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return;
        if (file.size > MAX_SIZE_BYTES) return;
        dataToSend.append("imovel[photos][]", file);
      });
    }
  
    // Incluir IDs de fotos marcadas para remoção
    removePhotoIds.forEach((id) => dataToSend.append("imovel[remove_photo_ids][]", id));
  
    try {
      const config = {
        onUploadProgress: (event) => {
          if (!event || !event.total) return;
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress((prev) => prev.map((p) => ({ ...p, progress: percent })));
        },
      };

      if (imovelSendoEditado) {
        await updateImovel(imovelSendoEditado.id, dataToSend, config);
      } else {
        await createImovel(dataToSend, config);
      }
  
      setIsDirty(false);
      setRemovePhotoIds([]);
      setUploadProgress((prev) => prev.map((p) => ({ ...p, progress: 100 })));
      // Notifica o componente pai para aplicar pós-sucesso (toast/fechamento/recarregar lista)
      onFormSubmit?.(dataToSend, imovelSendoEditado?.id, { ...options, skipNetwork: true });
    } catch (err) {
      setFileErrors((prev) => [...prev, err.message || "Falha ao enviar fotos"]);
      // Política: em erro, não limpar removePhotoIds (para manter UI consistente)
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="formulario-container">
      <h2>{imovelSendoEditado ? "Editar Imóvel" : "Adicionar Novo Imóvel"}</h2>
      <form onSubmit={(e) => handleSubmit(e)}>
        <h3 className="form-section-title">Informações Principais</h3>
        <div className="form-grid">
          <label className="grid-col-span-3">
            Nome do Empreendimento:
            <input
              ref={firstFieldRef}
              type="text"
              name="nome_empreendimento"
              value={formData.nome_empreendimento}
              onChange={handleFormChange}
              required
            />
          </label>
          <label>
            Tipo:
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleFormChange}
            >
              <option value="apartamento">Apartamento</option>
              <option value="casa">Casa</option>
              <option value="terreno">Terreno</option>
              <option value="flat">Flat</option>
              <option value="cobertura">Cobertura</option>
              <option value="kitnet">Kitnet</option>
            </select>
          </label>
          <label>
            Finalidade:
            <select
              name="finalidade"
              value={formData.finalidade}
              onChange={handleFormChange}
            >
              <option value="venda">Venda</option>
              <option value="aluguel">Aluguel</option>
            </select>
          </label>
          <label>
            Condição:
            <select
              name="condicao"
              value={formData.condicao}
              onChange={handleFormChange}
            >
              <option value="usado">Usado</option>
              <option value="lancamento">Lançamento</option>
              <option value="em_obras">Em Obras</option>
            </select>
          </label>
          <label>
            Valor do Imóvel:
            <CurrencyInput
              id="valor"
              name="valor"
              value={formData.valor}
              onChange={(num) =>
                setFormData((prev) => ({ ...prev, valor: num }))
              }
              required
            />
          </label>
          <label>
            Valor do Condomínio:
            <CurrencyInput
              id="valor_condominio"
              name="valor_condominio"
              value={formData.valor_condominio}
              onChange={(num) =>
                setFormData((prev) => ({ ...prev, valor_condominio: num }))
              }
            />
          </label>
          <label>
            Valor do IPTU:
            <CurrencyInput
              id="valor_iptu"
              name="valor_iptu"
              value={formData.valor_iptu}
              onChange={(num) =>
                setFormData((prev) => ({ ...prev, valor_iptu: num }))
              }
            />
          </label>
          <label className="grid-col-span-3">
            <span className="label-title">Descrição:</span>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleFormChange}
              rows="4"
            ></textarea>
          </label>
        </div>

        <h3 className="form-section-title">Endereço</h3>
        <AddressForm
          address={formData.endereco_attributes}
          onFieldChange={(e) => handleFormChange(e)}
          gridClass="form-grid"
        />

        <h3 className="form-section-title">Características do Imóvel</h3>
        <div className="form-grid">
          <label>
            Quartos:
            <input
              type="number"
              name="quartos"
              value={formData.quartos}
              onChange={handleFormChange}
              min="0"
            />
          </label>
          <label>
            Suítes:
            <input
              type="number"
              name="suites"
              value={formData.suites}
              onChange={handleFormChange}
              min="0"
            />
          </label>
          <label>
            Banheiros:
            <input
              type="number"
              name="banheiros"
              value={formData.banheiros}
              onChange={handleFormChange}
              min="0"
            />
          </label>
          <label>
            Vagas:
            <input
              type="number"
              name="vagas_garagem"
              value={formData.vagas_garagem}
              onChange={handleFormChange}
              min="0"
            />
          </label>
          <label>
            Metragem (m²):
            <input
              type="number"
              name="metragem"
              value={formData.metragem}
              onChange={(e) => {
                const { value } = e.target;
                // Permitir vírgula como separador decimal, convertendo para ponto para armazenamento
                const normalized = value.replace(',', '.');
                const num = normalized === '' ? '' : Number(normalized);
                setFormData((prev) => ({ ...prev, metragem: isNaN(num) ? '' : num }));
                setIsDirty(true);
              }}
              min="0"
              step="0.01"
              inputMode="decimal"
              placeholder="Ex.: 129,50"
            />
          </label>
          <label>
            Ano de Construção:
            <input
              type="number"
              name="ano_construcao"
              value={formData.ano_construcao}
              onChange={handleFormChange}
              placeholder="Ex: 2020"
            />
          </label>
          <label>
            Posição Solar:
            <select
              name="posicao_solar"
              value={formData.posicao_solar}
              onChange={handleFormChange}
            >
              <option value="">Selecione...</option>
              <option value="norte">Norte</option>
              <option value="sul">Sul</option>
              <option value="leste">Leste (Nascente)</option>
              <option value="oeste">Oeste (Poente)</option>
            </select>
          </label>
        </div>

        {/* Seção de Cômodos (1:1 com Imóvel) */}
        <h3 className="form-section-title">Cômodos</h3>
        <div className="comodidades-grid">
          {[
            { key: "area_de_servico", label: "Área de serviço" },
            { key: "cozinha", label: "Cozinha" },
            { key: "sala_de_estar", label: "Sala de estar" },
            { key: "sala_de_jantar", label: "Sala de jantar" },
            { key: "suite", label: "Suíte" },
            { key: "varanda", label: "Varanda" },
            { key: "wc_social", label: "WC social" },
            { key: "wc_de_servico", label: "WC de serviço" },
            { key: "despensa", label: "Despensa" },
            { key: "quarto_de_servico", label: "Quarto de serviço" },
            { key: "sala_de_visita", label: "Sala de visita" },
            { key: "banheiro_social", label: "Banheiro social" },
            { key: "lavabo", label: "Lavabo" },
            { key: "escritorio", label: "Escritório" },
            { key: "home_office", label: "Home office" },
            { key: "closet", label: "Closet" },
            { key: "hall", label: "Hall" },
            { key: "sala_de_tv", label: "Sala de TV" },
            { key: "terraco", label: "Terraço" },
          ].map((item) => (
            <label key={item.key}>
              <input
                type="checkbox"
                name={`comodo_attributes.${item.key}`}
                checked={!!formData.comodo_attributes?.[item.key]}
                onChange={handleComodoChange}
              />
              {item.label}
            </label>
          ))}
        </div>
        {/* Fim seção de Cômodos */}

        {/* Seção de Infraestrutura (1:1 com Imóvel) */}
        <h3 className="form-section-title">Infraestrutura</h3>
        <div className="comodidades-grid">
          {[
            { key: "garagem", label: "Garagem" },
            { key: "lavanderia", label: "Lavanderia" },
            { key: "jardim_interno", label: "Jardim interno" },
            { key: "jardim_externo", label: "Jardim externo" },
            { key: "piscina", label: "Piscina" },
            { key: "playground", label: "Playground" },
            { key: "portaria_24h", label: "Portaria 24h" },
            { key: "salao_de_festas", label: "Salão de festas" },
            { key: "sistema_de_seguranca", label: "Sistema de segurança" },
            { key: "churrasqueira", label: "Churrasqueira" },
            { key: "elevador", label: "Elevador" },
            { key: "sauna", label: "Sauna" },
            { key: "quadra_poliesportiva", label: "Quadra poliesportiva" },
            { key: "academia", label: "Academia" },
            { key: "campo_de_futebol", label: "Campo de futebol" },
            { key: "bicicletario", label: "Bicicletário" },
            { key: "area_de_lazer", label: "Área de lazer" },
            { key: "central_de_gas", label: "Central de gás" },
            { key: "portao_eletronico", label: "Portão eletrônico" },
            { key: "gerador", label: "Gerador" },
            { key: "interfone", label: "Interfone" },
            { key: "guarita", label: "Guarita" },
            { key: "monitoramento", label: "Monitoramento" },
            { key: "cftv", label: "CFTV" },
            { key: "brinquedoteca", label: "Brinquedoteca" },
            { key: "salao_de_jogos", label: "Salão de jogos" },
            { key: "spa", label: "Spa" },
            { key: "coworking", label: "Coworking" },
            { key: "pet_place", label: "Pet place" },
            { key: "car_wash", label: "Car wash" },
            { key: "mini_mercado", label: "Mini mercado" },
            {
              key: "estacionamento_visitantes",
              label: "Estacionamento visitantes",
            },
          ].map((item) => (
            <label key={item.key}>
              <input
                type="checkbox"
                name={`infraestrutura_attributes.${item.key}`}
                checked={!!formData.infraestrutura_attributes?.[item.key]}
                onChange={handleComodoChange}
              />
              {item.label}
            </label>
          ))}
        </div>
        {/* Fim seção Infraestrutura */}

        {/* Seção de Piso */}
        <h3 className="form-section-title">Piso</h3>
        <div className="comodidades-grid">
          {[
            { key: "porcelanato", label: "Porcelanato" },
            { key: "ceramica", label: "Cerâmica" },
            { key: "granito", label: "Granito" },
            { key: "laminado", label: "Laminado" },
            { key: "madeira", label: "Madeira" },
            { key: "vinilico", label: "Vinílico" },
            { key: "carpete", label: "Carpete" },
            { key: "ardosia", label: "Ardósia" },
            { key: "marmore", label: "Mármore" },
            { key: "taco", label: "Taco" },
          ].map((item) => (
            <label key={item.key}>
              <input
                type="checkbox"
                name={`piso_attributes.${item.key}`}
                checked={!!formData.piso_attributes?.[item.key]}
                onChange={handleComodoChange}
              />
              {item.label}
            </label>
          ))}
        </div>
        {/* Fim seção Piso */}

        {/* Seção de Posição */}
        <h3 className="form-section-title">Posição</h3>
        <div className="comodidades-grid">
          {[
            { key: "nascente", label: "Nascente" },
            { key: "vista_para_o_mar", label: "Vista para o mar" },
            { key: "beira_mar", label: "Beira-mar" },
            { key: "poente", label: "Poente" },
            { key: "frente_para_o_mar", label: "Frente para o mar" },
            { key: "norte", label: "Norte" },
            { key: "sul", label: "Sul" },
            { key: "leste", label: "Leste" },
            { key: "oeste", label: "Oeste" },
          ].map((item) => (
            <label key={item.key}>
              <input
                type="checkbox"
                name={`posicao_attributes.${item.key}`}
                checked={!!formData.posicao_attributes?.[item.key]}
                onChange={handleComodoChange}
              />
              {item.label}
            </label>
          ))}
        </div>
        {/* Fim seção Posição */}

        {/* Seção de Proximidades */}
        <h3 className="form-section-title">Proximidades</h3>
        <div className="comodidades-grid">
          {[
            { key: "bares_e_restaurantes", label: "Bares e restaurantes" },
            { key: "escola", label: "Escola" },
            { key: "faculdade", label: "Faculdade" },
            { key: "farmacia", label: "Farmácia" },
            { key: "hospital", label: "Hospital" },
            { key: "padaria", label: "Padaria" },
            { key: "pet_shop", label: "Pet shop" },
            { key: "shopping_center", label: "Shopping center" },
            { key: "supermercado", label: "Supermercado" },
            { key: "banco", label: "Banco" },
            { key: "shopping", label: "Shopping" },
            { key: "praia", label: "Praia" },
            { key: "parque", label: "Parque" },
            { key: "metro", label: "Metrô" },
            { key: "estacao_de_metro", label: "Estação de metrô" },
            { key: "estacao", label: "Estação" },
            { key: "ponto_de_onibus", label: "Ponto de ônibus" },
            { key: "terminal", label: "Terminal" },
            { key: "igreja", label: "Igreja" },
            { key: "feira", label: "Feira" },
            { key: "mercado", label: "Mercado" },
            { key: "posto_de_gasolina", label: "Posto de gasolina" },
            { key: "delegacia", label: "Delegacia" },
            { key: "correios", label: "Correios" },
            { key: "loterica", label: "Lotérica" },
            { key: "universidade", label: "Universidade" },
            { key: "creche", label: "Creche" },
          ].map((item) => (
            <label key={item.key}>
              <input
                type="checkbox"
                name={`proximidade_attributes.${item.key}`}
                checked={!!formData.proximidade_attributes?.[item.key]}
                onChange={handleComodoChange}
              />
              {item.label}
            </label>
          ))}
        </div>
        {/* Fim seção Proximidades */}

        {/* Campo de fotos */}
        <label className="input-fotos-label" htmlFor="imovel-photos-input">
          Fotos do Imóvel:
        </label>

        {imovelSendoEditado && existingPhotos.length > 0 && (
          <div className="fotos-existentes">
            <h4>Fotos atuais</h4>
            <div className="fotos-grid">
              {existingPhotos.map((p, idx) => {
                const isMarked = removePhotoIds.includes(p.id);
                return (
                  <div key={p.id || idx} className={`foto-thumb ${isMarked ? "marked" : ""}`}>
                    <img src={p.thumb_url || p.url} alt={`Foto atual ${idx + 1}`} />
                    {isMarked && <span className="badge-remover">Removerá ao salvar</span>}
                    <button
                      type="button"
                      className="remove-foto"
                      onClick={() => markPhotoForRemoval(p.id)}
                      title={isMarked ? "Desmarcar remoção" : "Marcar para remover"}
                    >
                      {isMarked ? "Desmarcar" : "Remover"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <input
          id="imovel-photos-input"
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          accept={ALLOWED_IMAGE_TYPES.join(',')}
          style={{ display: "none" }}
        />
        <div
          className={`dropzone ${isDragging ? "dragging" : ""}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={(e) => {
            e.preventDefault();
            fileInputRef.current?.click();
          }}
          role="button"
          aria-label="Área para adicionar fotos do imóvel"
        >
          <div className="dropzone-instructions">
            <strong>Arraste e solte</strong> as imagens aqui ou <u>clique</u>{" "}
            para selecionar.
            <span className="dropzone-hint">
              Até {MAX_FILES} imagens, máximo {MAX_SIZE_MB}MB cada.
            </span>
          </div>
        </div>
        {fileErrors.length > 0 && (
          <ul className="file-errors" role="alert">
            {fileErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        )}
        <style>
          {`
            .upload-progress-list { margin: 12px 0; }
            .upload-progress-item { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
            .upload-file-name { min-width: 160px; font-size: 0.9rem; color: #333; }
            .progress-bar { flex: 1; background: #eee; height: 8px; border-radius: 4px; overflow: hidden; }
            .progress-bar-fill { height: 100%; background: #4caf50; transition: width 0.2s ease; }
          `}
        </style>

        {uploadProgress.length > 0 && (
          <div className="upload-progress-list">
            {uploadProgress.map((p, idx) => (
              <div key={idx} className="upload-progress-item">
                <span className="upload-file-name">{p.name}</span>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${p.progress}%` }} />
                </div>
                <span className="upload-percent">{p.progress}%</span>
              </div>
            ))}
          </div>
        )}

        {previewUrls.length > 0 && (
          <div className="fotos-grid">
            {previewUrls.map((url, idx) => (
              <div key={idx} className="foto-thumb">
                <img src={url} alt={`Pré-visualização ${idx + 1}`} />
                <button
                  type="button"
                  className="remove-foto"
                  onClick={() => removeFileAt(idx)}
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="form-actions">
          <button type="submit" disabled={isSubmitting}>
            {imovelSendoEditado ? "Salvar Alterações" : "Salvar Imóvel"}
          </button>
          {!imovelSendoEditado && (
            <button
              type="button"
              className="save-another"
              onClick={() =>
                handleSubmit(undefined, { continueCreating: true })
              }
              disabled={isSubmitting}
            >
              Salvar e cadastrar outro
            </button>
          )}
          <button
            type="button"
            onClick={handleClose}
            className="cancel-button"
            disabled={isSubmitting}
          >
            {imovelSendoEditado ? "Cancelar" : "Fechar"}
          </button>
        </div>
      </form>

      {/* Modal de confirmação de fechamento */}
      <ConfirmModal
        isOpen={isCloseModalOpen}
        title="Descartar alterações?"
        message="Existem alterações não salvas. Deseja realmente fechar?"
        confirmLabel={
          imovelSendoEditado ? "Cancelar edição" : "Fechar formulário"
        }
        cancelLabel="Continuar editando"
        onConfirm={() => {
          setIsCloseModalOpen(false);
          onCancelEdit?.();
          setIsDirty(false);
        }}
        onCancel={() => setIsCloseModalOpen(false)}
      />
    </div>
  );
}

export default ImovelForm;
