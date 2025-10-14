import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import * as api from "../../Servicos/Api";

function PropostaDetalhesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proposta, setProposta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ valor_proposta: "", condicoes_pagamento: "" });

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      setLoading(true);
      try {
        const resp = await api.getPropostaById(id, { signal: controller.signal });
        setProposta(resp.data);
        // Inicializa o formulário com os dados atuais
        setForm({
          valor_proposta: resp.data?.valor_proposta ?? "",
          condicoes_pagamento: typeof resp.data?.condicoes_pagamento === "string"
            ? resp.data?.condicoes_pagamento
            : JSON.stringify(resp.data?.condicoes_pagamento ?? {}),
        });
      } catch (error) {
        const msg = error?.response?.data?.error || "Erro ao carregar a proposta.";
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        valor_proposta: form.valor_proposta,
        condicoes_pagamento: form.condicoes_pagamento,
      };
      const resp = await api.updateProposta(id, payload);
      setProposta(resp.data);
      toast.success("Proposta atualizada com sucesso.");
    } catch (error) {
      const msg = error?.response?.data?.error || "Erro ao atualizar a proposta.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleExcluir = async () => {
    if (!window.confirm("Tem certeza que deseja excluir esta proposta?")) return;
    setLoading(true);
    try {
      await api.deleteProposta(id);
      toast.success("Proposta excluída.");
      navigate("/propostas");
    } catch (error) {
      const msg = error?.response?.data?.error || "Erro ao excluir a proposta.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrencyBR = (value) => {
    const num = Number(value);
    if (Number.isNaN(num)) return value || "-";
    return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  if (!proposta) return (
    <div>
      <Toaster position="top-right" />
      {loading ? "Carregando..." : "Proposta não encontrada."}
    </div>
  );

  return (
    <div>
      <Toaster position="top-right" />
      <h1>Proposta #{proposta.id}</h1>
      <div style={{ marginBottom: 12 }}>
        <Link to="/propostas">&larr; Voltar para a lista</Link>
      </div>

      <div className="info-card" style={{ marginBottom: 16 }}>
        <h3>Resumo</h3>
        <p><strong>Cliente:</strong> {proposta.cliente?.nome || proposta.cliente?.id || "-"}</p>
        <p><strong>Imóvel:</strong> {proposta.imovel?.nome_empreendimento || proposta.imovel?.id || "-"}</p>
        <p><strong>Valor:</strong> {formatCurrencyBR(proposta.valor_proposta)}</p>
        <p><strong>Status:</strong> {proposta.status}</p>
      </div>

      <div className="proposta-section">
        <h3>Editar Proposta</h3>
        <form onSubmit={handleSubmit} className="formulario-container">
          <label>
            Valor da Proposta (R$):
            <input type="number" value={form.valor_proposta} onChange={(e) => setForm({ ...form, valor_proposta: e.target.value })} required />
          </label>
          <label>
            Condições de Pagamento (JSON ou texto):
            <textarea value={form.condicoes_pagamento} onChange={(e) => setForm({ ...form, condicoes_pagamento: e.target.value })} />
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" disabled={loading}>{loading ? "Salvando..." : "Salvar"}</button>
            <button type="button" onClick={handleExcluir} disabled={loading}>Excluir</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PropostaDetalhesPage;