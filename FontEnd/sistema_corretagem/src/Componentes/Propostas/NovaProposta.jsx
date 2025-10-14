import React, { useState, useEffect } from "react";
import * as api from "../../Servicos/Api";
import { Toaster, toast } from "react-hot-toast";
import "./NovaProposta.css"; // Crie um arquivo CSS para estilizar
import { useAuth } from "../../Contextos/AuthContexto";
import { formatCurrencyBR } from "../Shared/CurrencyInput";

function NovaProposta() {
  // Estados para popular os selects
  const [clientes, setClientes] = useState([]);
  const [perfis, setPerfis] = useState([]);
  const [imoveisCompativeis, setImoveisCompativeis] = useState([]);
  // Filtros rápidos (sem salvar)
  const [filtrosRapidos, setFiltrosRapidos] = useState({
    bairrosTexto: "",
    valor_minimo: "",
    valor_maximo: "",
    quartos_minimo: "",
    tipo: "",
  });

  // Estados para as seleções do usuário
  const [clienteSelecionadoId, setClienteSelecionadoId] = useState("");
  const [perfilSelecionadoId, setPerfilSelecionadoId] = useState("");
  const [imovelSelecionado, setImovelSelecionado] = useState(null);

  // Estado do formulário da proposta
  const [formData, setFormData] = useState({
    valor_proposta: "",
    condicoes_pagamento: "",
  });
  const [loading, setLoading] = useState(false);

  // Dados detalhados do cliente selecionado e corretor logado
  const [clienteDetalhes, setClienteDetalhes] = useState(null);
  const { user: corretor } = useAuth();
  // Novo: detalhes completos do corretor (inclui perfil_corretor)
  const [corretorDetalhes, setCorretorDetalhes] = useState(null);

  // Controle: indicar se já houve uma busca para exibir contagem de resultados
  const [buscaRealizada, setBuscaRealizada] = useState(false);

  // Novo: metadados de paginação retornados pelo backend (Pagy)
  const [pagyInfoBusca, setPagyInfoBusca] = useState(null);
  const parsePagyHeaders = (headers) => {
    if (!headers || !headers["total-count"]) return null;
    return {
      currentPage: parseInt(headers["current-page"], 10),
      items: parseInt(headers["items"], 10),
      totalPages: parseInt(headers["total-pages"], 10),
      totalCount: parseInt(headers["total-count"], 10),
    };
  };

  // Helper: normaliza bairros do perfil para texto separado por vírgula
  const getPerfilBairrosTexto = (perfil) => {
    if (!perfil) return "-";
    const lista = Array.isArray(perfil.bairros)
      ? perfil.bairros
      : Array.isArray(perfil.bairro_preferencia)
      ? perfil.bairro_preferencia
      : typeof perfil.bairro_preferencia === "string"
      ? perfil.bairro_preferencia
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    if (lista.length > 0) return lista.join(", ");
    return typeof perfil.bairro_preferencia === "string" && perfil.bairro_preferencia.trim() !== ""
      ? perfil.bairro_preferencia
      : "-";
  };

  // Derivado: há filtros rápidos informados?
  const hasFiltrosRapidos =
    (filtrosRapidos.bairrosTexto && filtrosRapidos.bairrosTexto.trim() !== "") ||
    filtrosRapidos.valor_minimo ||
    filtrosRapidos.valor_maximo ||
    filtrosRapidos.quartos_minimo ||
    filtrosRapidos.tipo;

  // Perfil atualmente selecionado (para resumo)
  const perfilAtual = perfis.find((p) => String(p.id) === String(perfilSelecionadoId));

  // Busca os clientes do corretor quando a tela carrega
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const response = await api.getClientes({}, { signal: controller.signal });
        setClientes(response.data);
      } catch (error) {
        if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") return;
        toast.error("Erro ao buscar clientes.");
      }
    })();
    return () => controller.abort();
  }, []);

  // Busca os perfis sempre que um cliente for selecionado
  useEffect(() => {
    if (!clienteSelecionadoId) {
      setPerfis([]);
      setPerfilSelecionadoId("");
      setBuscaRealizada(false);
      setPagyInfoBusca(null); // reset da paginação da busca
      setImoveisCompativeis([]);
      return;
    }
    const controller = new AbortController();
    (async () => {
      try {
        const response = await api.getPerfisBusca(clienteSelecionadoId, { signal: controller.signal });
        setPerfis(response.data);
      } catch (error) {
        if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") return;
        toast.error("Erro ao buscar perfis do cliente.");
      }
    })();
    return () => controller.abort();
  }, [clienteSelecionadoId]);

  // Busca detalhes do cliente (inclui cônjuge e renda familiar total) quando selecionado
  useEffect(() => {
    if (!clienteSelecionadoId) {
      setClienteDetalhes(null);
      return;
    }
    const controller = new AbortController();
    (async () => {
      try {
        const response = await api.getClienteById(clienteSelecionadoId, { signal: controller.signal });
        setClienteDetalhes(response.data);
      } catch (error) {
        if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") return;
        toast.error("Erro ao buscar detalhes do cliente.");
      }
    })();
    return () => controller.abort();
  }, [clienteSelecionadoId]);

  // Buscar detalhes completos do corretor para garantir CRECI/Estado
  useEffect(() => {
    if (!corretor?.id) return;
    // Se já veio com perfil_corretor no contexto, usar diretamente
    if (corretor.perfil_corretor) {
      setCorretorDetalhes(corretor);
      return;
    }
    const controller = new AbortController();
    (async () => {
      try {
        const response = await api.getUsuarioById(corretor.id, { signal: controller.signal });
        setCorretorDetalhes(response.data);
      } catch (error) {
        if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") return;
      }
    })();
    return () => controller.abort();
  }, [corretor]);

  const handleBuscarImoveis = async () => {
    setLoading(true);
    setBuscaRealizada(false);
    setImovelSelecionado(null); // Limpa a seleção anterior
    try {
      if (perfilSelecionadoId) {
        const response = await api.buscarImoveisCompativeis(perfilSelecionadoId, { page: 1 });
        setImoveisCompativeis(response.data);
        const info = parsePagyHeaders(response.headers);
        setPagyInfoBusca(info);
        setBuscaRealizada(true);
        toast.success(`${info?.totalCount ?? response.data.length} imóveis compatíveis encontrados!`);
      } else {
        // Busca por filtros rápidos, sem salvar perfil
        if (!clienteSelecionadoId) {
          toast.error("Selecione um cliente para buscar imóveis.");
          return;
        }
        // Monta parâmetros mínimos viáveis
        const bairrosArr = (filtrosRapidos.bairrosTexto || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        const paramsBase = {};
        if (filtrosRapidos.valor_minimo)
          paramsBase.valor_minimo = Number(filtrosRapidos.valor_minimo);
        if (filtrosRapidos.valor_maximo)
          paramsBase.valor_maximo = Number(filtrosRapidos.valor_maximo);
        if (filtrosRapidos.quartos_minimo)
          paramsBase.quartos_minimo = Number(filtrosRapidos.quartos_minimo);
        if (filtrosRapidos.tipo) paramsBase.tipo = filtrosRapidos.tipo;

        if (bairrosArr.length === 0 && Object.keys(paramsBase).length === 0) {
          toast.error("Informe pelo menos um filtro rápido.");
          return;
        }

        let results = [];
        if (bairrosArr.length > 1) {
          // Aceitar múltiplos bairros: faz consultas paralelas por bairro e mescla resultados
          const promises = bairrosArr.map((bairro) =>
            api.getImoveis({ ...paramsBase, bairro })
          );
          const responses = await Promise.all(promises);
          results = responses.flatMap((r) => r.data);
          const dedup = new Map();
          results.forEach((im) => dedup.set(im.id, im));
          results = Array.from(dedup.values());
        } else {
          const params = { ...paramsBase };
          if (bairrosArr.length === 1) params.bairro = bairrosArr[0];
          const response = await api.getImoveis(params);
          results = response.data;
        }
        setImoveisCompativeis(results);
        setPagyInfoBusca(null); // sem paginação quando via filtros rápidos
        setBuscaRealizada(true);
        toast.success(`${results.length} imóveis encontrados pelos filtros!`);
      }
    } catch (error) {
      toast.error("Erro ao buscar imóveis.");
    } finally {
      setLoading(false);
    }
  };

  // Novo: controle de paginação da busca por perfil selecionado
  const handlePageChangeBusca = async (newPage) => {
    if (!perfilSelecionadoId) return;
    setLoading(true);
    try {
      const response = await api.buscarImoveisCompativeis(perfilSelecionadoId, { page: newPage });
      setImoveisCompativeis(response.data);
      setPagyInfoBusca(parsePagyHeaders(response.headers));
    } catch (error) {
      toast.error("Erro ao paginar imóveis.");
    } finally {
      setLoading(false);
    }
  };

  const handlePropostaSubmit = async (e) => {
    e.preventDefault();
    if (!imovelSelecionado) return toast.error("Selecione um imóvel da lista.");

    const propostaData = {
      ...formData,
      cliente_id: clienteSelecionadoId,
      imovel_id: imovelSelecionado.id,
      ...(perfilSelecionadoId ? { perfil_busca_id: perfilSelecionadoId } : {}),
    };

    setLoading(true);
    try {
      await api.createProposta(propostaData);
      toast.success("Proposta criada e imóvel reservado com sucesso!");
      // Aqui você poderia limpar a tela ou redirecionar o usuário
      setImoveisCompativeis([]);
      setImovelSelecionado(null);
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Erro ao criar proposta.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Utilidades de formatação para exibição
  const formatCPF = (cpf) => {
    if (!cpf) return "Não informado";
    const cpfLimpo = cpf.toString().replace(/\D/g, "");
    if (cpfLimpo.length !== 11) return cpf;
    return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };
  const formatCurrencyBR = (value) => {
    const num = Number(value);
    if (Number.isNaN(num)) return "Não informado";
    return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  return (
    <div>
      <Toaster position="top-right" />
      <h1>Gerar Nova Proposta</h1>

      <div className="proposta-section">
        <h3>1. Selecione o Cliente e o Perfil de Busca</h3>
        <div className="form-group-row">
          <label>
            Cliente:
            <select
              value={clienteSelecionadoId}
              onChange={(e) => setClienteSelecionadoId(e.target.value)}
            >
              <option value="">-- Selecione um Cliente --</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </label>
          <label>
            Perfil de Busca:
            <select
              value={perfilSelecionadoId}
              onChange={(e) => setPerfilSelecionadoId(e.target.value)}
              disabled={!clienteSelecionadoId}
            >
              <option value="">-- Selecione um Perfil --</option>
              {perfis.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.titulo_busca}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          onClick={handleBuscarImoveis}
          disabled={!perfilSelecionadoId || loading}
        >
          {loading ? "Buscando..." : "Buscar Imóveis Compatíveis"}
        </button>
        {/* Resumo da Busca */}
        {(perfilSelecionadoId || hasFiltrosRapidos) && (
          <div className="proposta-subsection">
            <h4>Resumo da Busca</h4>
            {perfilSelecionadoId && perfilAtual ? (
              <div className="info-card">
                <p><strong>Perfil:</strong> {perfilAtual.titulo_busca}</p>
                <p><strong>Bairros:</strong> {getPerfilBairrosTexto(perfilAtual)}</p>
                <p><strong>Tipo de negócio:</strong> {perfilAtual.tipo_negocio || "-"}</p>
                <p><strong>Condição:</strong> {perfilAtual.condicao_imovel || "-"}</p>
                <p><strong>Valor máximo:</strong> {perfilAtual.valor_maximo_imovel ? formatCurrencyBR(perfilAtual.valor_maximo_imovel) : "-"}</p>
                <p><strong>Quartos mínimos:</strong> {perfilAtual.quartos_minimo ?? "-"}</p>
              </div>
            ) : (
              <div className="info-card">
                <p><strong>Filtros rápidos:</strong></p>
                <p><strong>Bairros:</strong> {filtrosRapidos.bairrosTexto || "-"}</p>
                <p><strong>Tipo:</strong> {filtrosRapidos.tipo || "-"}</p>
                <p><strong>Faixa de valor:</strong> {filtrosRapidos.valor_minimo || filtrosRapidos.valor_maximo ? `${filtrosRapidos.valor_minimo ? formatCurrencyBR(filtrosRapidos.valor_minimo) : "-"} até ${filtrosRapidos.valor_maximo ? formatCurrencyBR(filtrosRapidos.valor_maximo) : "-"}` : "-"}</p>
                <p><strong>Quartos mínimos:</strong> {filtrosRapidos.quartos_minimo || "-"}</p>
              </div>
            )}
          </div>
        )}
        {/* Filtros rápidos (sem salvar) - exibidos quando não há perfil selecionado ou o cliente não possui perfis */}
        {clienteSelecionadoId && (perfis.length === 0 || !perfilSelecionadoId) && (
          <div className="quick-filters proposta-subsection">
            <h4>Filtros Rápidos (sem salvar)</h4>
            <div className="form-group-row">
              <label>
                Bairros (separe por vírgula):
                <input
                  type="text"
                  placeholder="Centro, Jardim, Copacabana"
                  value={filtrosRapidos.bairrosTexto}
                  onChange={(e) =>
                    setFiltrosRapidos({
                      ...filtrosRapidos,
                      bairrosTexto: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                Tipo:
                <select
                  value={filtrosRapidos.tipo}
                  onChange={(e) =>
                    setFiltrosRapidos({
                      ...filtrosRapidos,
                      tipo: e.target.value,
                    })
                  }
                >
                  <option value="">-- Qualquer --</option>
                  <option value="apartamento">Apartamento</option>
                  <option value="casa">Casa</option>
                  <option value="flat">Flat</option>
                  <option value="cobertura">Cobertura</option>
                  <option value="kitnet">Kitnet</option>
                  <option value="terreno">Terreno</option>
                </select>
              </label>
            </div>
            <div className="form-group-row">
              <label>
                Valor mínimo (R$):
                <input
                  type="number"
                  value={filtrosRapidos.valor_minimo}
                  onChange={(e) =>
                    setFiltrosRapidos({
                      ...filtrosRapidos,
                      valor_minimo: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                Valor máximo (R$):
                <input
                  type="number"
                  value={filtrosRapidos.valor_maximo}
                  onChange={(e) =>
                    setFiltrosRapidos({
                      ...filtrosRapidos,
                      valor_maximo: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                Quartos mínimos:
                <input
                  type="number"
                  value={filtrosRapidos.quartos_minimo}
                  onChange={(e) =>
                    setFiltrosRapidos({
                      ...filtrosRapidos,
                      quartos_minimo: e.target.value,
                    })
                  }
                />
              </label>
            </div>
            <small>Busca para esta proposta, sem criar ou editar perfil.</small>
            <div className="form-group-row">
              <button
                onClick={handleBuscarImoveis}
                disabled={(!perfilSelecionadoId && !hasFiltrosRapidos) || loading}
              >
                {loading
                  ? "Buscando..."
                  : perfilSelecionadoId
                  ? "Buscar Imóveis Compatíveis"
                  : "Buscar Imóveis"}
              </button>
            </div>
          </div>
        )}

      </div>

      {clienteDetalhes && (
        <div className="proposta-section">
          <h3>Resumo do Cliente</h3>
          <div className="form-group-row">
            <div className="info-card">
              <h4>Cliente</h4>
              <p>
                <strong>Nome:</strong> {clienteDetalhes.nome}
              </p>
              <p>
                <strong>CPF:</strong> {formatCPF(clienteDetalhes.cpf)}
              </p>
              <p>
                <strong>Profissão:</strong> {clienteDetalhes.profissao || "Não informado"}
              </p>
              <p>
                <strong>Renda:</strong> {formatCurrencyBR(clienteDetalhes.renda)}
              </p>
            </div>
            {clienteDetalhes.conjuge && (
              <div className="info-card">
                <h4>Cônjuge</h4>
                <p>
                  <strong>Nome:</strong> {clienteDetalhes.conjuge.nome}
                </p>
                <p>
                  <strong>CPF:</strong> {formatCPF(clienteDetalhes.conjuge.cpf)}
                </p>
                <p>
                  <strong>Profissão:</strong> {clienteDetalhes.conjuge.profissao || "Não informado"}
                </p>
                <p>
                  <strong>Renda:</strong> {formatCurrencyBR(clienteDetalhes.conjuge.renda)}
                </p>
              </div>
            )}
          </div>
          <div className="form-group-row">
            <div className="info-card">
              <h4>Renda Familiar Total</h4>
              <p>
                {formatCurrencyBR(
                  clienteDetalhes.renda_familiar_total ??
                    (Number(clienteDetalhes.renda || 0) +
                      Number(clienteDetalhes.conjuge?.renda || 0))
                )}
              </p>
            </div>
            {corretor && (
              <div className="info-card">
                <h4>Corretor Responsável</h4>
                <p>
                  <strong>Nome:</strong> {corretor.nome}
                </p>
                <p>
                  <strong>CRECI:</strong> {(corretorDetalhes?.perfil_corretor?.creci ?? corretor.perfil_corretor?.creci) || "Não informado"}
                </p>
                <p>
                  <strong>Estado:</strong> {(corretorDetalhes?.perfil_corretor?.creci_estado ?? corretor.perfil_corretor?.creci_estado) || "Não informado"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {imoveisCompativeis.length > 0 && (
        <div className="proposta-section">
          <h3>2. Selecione um Imóvel da Lista</h3>

          {pagyInfoBusca && pagyInfoBusca.totalPages > 1 && (
            <div className="pagination-controls" style={{ marginBottom: 8 }}>
              <button
                onClick={() => handlePageChangeBusca(pagyInfoBusca.currentPage - 1)}
                disabled={pagyInfoBusca.currentPage === 1 || loading}
              >
                &larr; Anterior
              </button>
              <span style={{ margin: "0 8px" }}>
                Página {pagyInfoBusca.currentPage} de {pagyInfoBusca.totalPages}
              </span>
              <button
                onClick={() => handlePageChangeBusca(pagyInfoBusca.currentPage + 1)}
                disabled={pagyInfoBusca.currentPage === pagyInfoBusca.totalPages || loading}
              >
                Próxima &rarr;
              </button>
            </div>
          )}

          <ul className="lista-grid">
            {imoveisCompativeis.map((imovel) => (
              <li
                key={imovel.id}
                className={`imovel-card ${
                  imovelSelecionado?.id === imovel.id ? "selecionado" : ""
                }`}
                onClick={() => setImovelSelecionado(imovel)}
              >
                {/* Reutilize a lógica de card da ImovelList aqui */}
                <strong>{imovel.nome_empreendimento}</strong>
                <p>Valor: {formatCurrencyBR(imovel.valor)}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {imovelSelecionado && (
        <div className="proposta-section">
          <h3>3. Preencha os Detalhes da Proposta</h3>
          <form
            onSubmit={handlePropostaSubmit}
            className="formulario-container"
          >
            <h4>Imóvel Selecionado: {imovelSelecionado.nome_empreendimento}</h4>
            <label>
              Valor da Proposta (R$):
              <input
                type="number"
                value={formData.valor_proposta}
                onChange={(e) =>
                  setFormData({ ...formData, valor_proposta: e.target.value })
                }
                required
              />
            </label>
            <label>
              Condições de Pagamento (Sinal, parcelas, etc.):
              <textarea
                value={formData.condicoes_pagamento}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    condicoes_pagamento: e.target.value,
                  })
                }
              />
            </label>
            <button type="submit" disabled={loading}>
              {loading ? "Enviando..." : "Enviar Proposta e Reservar Imóvel"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default NovaProposta;
