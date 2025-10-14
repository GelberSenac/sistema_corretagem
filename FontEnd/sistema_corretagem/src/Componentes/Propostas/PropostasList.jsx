import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import * as api from "../../Servicos/Api";

function PropostasList() {
  const [propostas, setPropostas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagy, setPagy] = useState(null);

  const parsePagyHeaders = (headers) => {
    if (!headers) return null;
    const get = (k) => headers[k] || headers[k?.toLowerCase?.()] || headers[k?.toUpperCase?.()];
    if (!get("total-count")) return null;
    return {
      currentPage: parseInt(get("current-page"), 10),
      items: parseInt(get("items"), 10),
      totalPages: parseInt(get("total-pages"), 10),
      totalCount: parseInt(get("total-count"), 10),
    };
  };

  const carregar = async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.getPropostas({ page });
      setPropostas(response.data);
      setPagy(parsePagyHeaders(response.headers));
    } catch (error) {
      const msg = error?.response?.data?.error || "Erro ao carregar propostas.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar(1);
  }, []);

  const handleExcluir = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta proposta?")) return;
    try {
      await api.deleteProposta(id);
      toast.success("Proposta excluída com sucesso.");
      // Recarrega mantendo a página atual
      await carregar(pagy?.currentPage || 1);
    } catch (error) {
      const msg = error?.response?.data?.error || "Erro ao excluir proposta.";
      toast.error(msg);
    }
  };

  const goPage = async (newPage) => {
    if (!pagy) return;
    if (newPage < 1 || newPage > pagy.totalPages) return;
    await carregar(newPage);
  };

  const formatCurrencyBR = (value) => {
    const num = Number(value);
    if (Number.isNaN(num)) return value || "-";
    return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  return (
    <div>
      <Toaster position="top-right" />
      <h1>Propostas</h1>
      <div style={{ marginBottom: 12 }}>
        <Link to="/propostas/nova" className="btn-primary">Nova Proposta</Link>
      </div>

      {pagy && pagy.totalPages > 1 && (
        <div className="pagination-controls" style={{ marginBottom: 8 }}>
          <button onClick={() => goPage(pagy.currentPage - 1)} disabled={loading || pagy.currentPage === 1}>&larr; Anterior</button>
          <span style={{ margin: "0 8px" }}>Página {pagy.currentPage} de {pagy.totalPages}</span>
          <button onClick={() => goPage(pagy.currentPage + 1)} disabled={loading || pagy.currentPage === pagy.totalPages}>Próxima &rarr;</button>
        </div>
      )}

      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Imóvel</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {propostas.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center" }}>{loading ? "Carregando..." : "Nenhuma proposta encontrada."}</td>
              </tr>
            )}
            {propostas.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.cliente?.nome || p.cliente?.id || "-"}</td>
                <td>{p.imovel?.nome_empreendimento || p.imovel?.id || "-"}</td>
                <td>{formatCurrencyBR(p.valor_proposta)}</td>
                <td>{p.status}</td>
                <td>
                  <Link to={`/propostas/${p.id}`} style={{ marginRight: 8 }}>Ver</Link>
                  <button onClick={() => handleExcluir(p.id)} disabled={loading}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PropostasList;