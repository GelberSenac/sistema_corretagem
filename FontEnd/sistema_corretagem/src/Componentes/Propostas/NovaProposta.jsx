import React, { useState, useEffect } from "react";
import * as api from "../../Servicos/Api";
import { Toaster, toast } from "react-hot-toast";
import "./NovaProposta.css"; // Crie um arquivo CSS para estilizar

function NovaProposta() {
  // Estados para popular os selects
  const [clientes, setClientes] = useState([]);
  const [perfis, setPerfis] = useState([]);
  const [imoveisCompativeis, setImoveisCompativeis] = useState([]);

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

  // Busca os clientes do corretor quando a tela carrega
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await api.getClientes();
        setClientes(response.data);
      } catch (error) {
        toast.error("Erro ao buscar clientes.");
      }
    };
    fetchClientes();
  }, []);

  // Busca os perfis sempre que um cliente for selecionado
  useEffect(() => {
    if (!clienteSelecionadoId) {
      setPerfis([]);
      setPerfilSelecionadoId("");
      return;
    }
    const fetchPerfis = async () => {
      try {
        const response = await api.getPerfisBusca(clienteSelecionadoId);
        setPerfis(response.data);
      } catch (error) {
        toast.error("Erro ao buscar perfis do cliente.");
      }
    };
    fetchPerfis();
  }, [clienteSelecionadoId]);

  const handleBuscarImoveis = async () => {
    if (!perfilSelecionadoId)
      return toast.error("Selecione um perfil de busca.");
    setLoading(true);
    setImovelSelecionado(null); // Limpa a seleção anterior
    try {
      const response = await api.buscarImoveisCompativeis(perfilSelecionadoId);
      setImoveisCompativeis(response.data);
      toast.success(`${response.data.length} imóveis compatíveis encontrados!`);
    } catch (error) {
      toast.error("Erro ao buscar imóveis.");
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
      </div>

      {imoveisCompativeis.length > 0 && (
        <div className="proposta-section">
          <h3>2. Selecione um Imóvel da Lista</h3>
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
                <p>Valor: R$ {Number(imovel.valor).toLocaleString("pt-BR")}</p>
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
