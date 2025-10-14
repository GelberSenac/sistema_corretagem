import React, { useState, useMemo } from "react";
import { useCRUD } from "../../Ganchos/useCRUD";
import { useAuth } from "../../Contextos/AuthContexto";
import ConfirmModal from "../Shared/ConfirmModal";
import { Toaster, toast } from "react-hot-toast";
import { formatCurrencyBR } from "../Shared/CurrencyInput";

// Formatação de moeda centralizada: use formatCurrencyBR de ../Shared/CurrencyInput

const Financeiro = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  // Hook principal de Lançamentos Financeiros com paginação, filtros e CRUD
  const {
    data: lancamentos,
    loading,
    error,
    pagyInfo,
    setPage,
    setFilters,
    summary,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useCRUD("lancamento_financeiros");

  // Hook de usuários sempre chamado; usamos dados apenas se admin
  const { data: usuarios } = useCRUD("usuarios");

  // --- Estado local para filtros ---
  const [filters, setLocalFilters] = useState({ tipo: "", inicio: "", fim: "", usuario_id: "" });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    const payload = { ...filters };
    // Evita enviar usuario_id se não for admin ou se estiver vazio
    if (!isAdmin) delete payload.usuario_id;
    if (!payload.usuario_id) delete payload.usuario_id;
    if (!payload.tipo) delete payload.tipo; // aceita "receita"/"despesa"
    if (!payload.inicio) delete payload.inicio;
    if (!payload.fim) delete payload.fim;
    setFilters(payload);
  };

  // --- Estado local para formulário CRUD ---
  const initialForm = {
    descricao: "",
    valor: "",
    tipo: 0, // 0 receita, 1 despesa
    data_lancamento: "",
    usuario_id: "", // usado só por admin
    proposta_id: "",
  };
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  // Estados do modal de exclusão
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const onFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditingId(null);
  };

  // onSubmit consolidado: a implementação única está mais abaixo com validações e normalizações.

  const onEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      descricao: item.descricao || "",
      valor: item.valor || "",
      tipo: item.tipo ?? 0,
      data_lancamento: (item.data_lancamento || "").slice(0, 10), // assume formato ISO
      usuario_id: item.usuario_id || "",
      proposta_id: item.proposta_id || "",
    });
  };

  const onDelete = async (id) => {
    try {
      await handleDelete(id);
      if (editingId === id) resetForm();
      toast.success("Lançamento financeiro excluído com sucesso!");
    } catch (err) {
      const status = err?.response?.status;
      const mensagem = status === 403
        ? "Você não tem permissão para excluir este lançamento."
        : status === 500
          ? "Erro interno no servidor ao excluir o lançamento."
          : "Ocorreu um erro ao excluir o lançamento.";
      toast.error(mensagem);
      console.error("[Financeiro] Erro ao excluir lançamento", { status, err });
    }
  };
  // Abrir modal de confirmação para excluir
  const handleDeleteClick = (id) => {
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };

  // --- Busca por texto e ordenação no front ---
  const [searchText, setSearchText] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key ? { key, direction: prev.direction === "asc" ? "desc" : "asc" } : { key, direction: "asc" }
    );
  };

  const filteredLancamentos = React.useMemo(() => {
    const term = searchText.trim().toLowerCase();
    let items = Array.isArray(lancamentos) ? lancamentos : [];
    if (term) {
      items = items.filter((i) => (i.descricao || "").toLowerCase().includes(term));
    }
    return items;
  }, [lancamentos, searchText]);

  const sortedLancamentos = React.useMemo(() => {
    const items = [...filteredLancamentos];
    if (!sortConfig.key) return items;
    items.sort((a, b) => {
      let av = 0;
      let bv = 0;
      if (sortConfig.key === "data_lancamento") {
        av = a.data_lancamento ? new Date(a.data_lancamento).getTime() : 0;
        bv = b.data_lancamento ? new Date(b.data_lancamento).getTime() : 0;
      } else if (sortConfig.key === "valor") {
        av = Number(a.valor || 0);
        bv = Number(b.valor || 0);
      }
      return sortConfig.direction === "asc" ? av - bv : bv - av;
    });
    return items;
  }, [filteredLancamentos, sortConfig]);

  const formatCurrencySigned = (value) => {
    const n = Number(value || 0);
    const formatted = formatCurrencyBR(Math.abs(n));
    return n < 0 ? `- ${formatted}` : formatted;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      // Validações simples
      if (payload.descricao && payload.descricao.length > 250) {
        alert("Descrição deve ter no máximo 250 caracteres.");
        return;
      }
      // Normalizações
      payload.valor = parseFloat(payload.valor || 0);
      payload.tipo = parseInt(payload.tipo, 10);
      if (!isAdmin) delete payload.usuario_id;
      if (!payload.descricao) delete payload.descricao;
      if (!payload.proposta_id) delete payload.proposta_id;

      if (editingId) {
        await handleUpdate(editingId, payload);
      } else {
        await handleCreate(payload);
      }
      resetForm();
    } catch (err) {
      console.error("Erro ao salvar lançamento:", err);
    }
  };

  // Memo detalhado de saldo (receitas, despesas, total) com formatação
  const saldoResumoDetalhado = React.useMemo(() => {
    const formatSaldo = (s) => ({
      receitas: formatCurrencyBR(Number(s.receitas) || 0),
      despesas: formatCurrencyBR(Number(s.despesas) || 0),
      total: formatCurrencySigned(Number(s.total) || 0),
    });
    const s = summary?.saldo;
    if (s && typeof s === "object" && (typeof s.receitas !== "undefined" || typeof s.total !== "undefined")) {
      return formatSaldo(s);
    }
    if (Array.isArray(lancamentos)) {
      const acc = lancamentos.reduce(
        (memo, item) => {
          const valor = Number(item.valor) || 0;
          const isReceita = item.tipo === 0 || item.tipo === "receita";
          if (isReceita) memo.receitas += valor; else memo.despesas += valor;
          return memo;
        },
        { receitas: 0, despesas: 0 }
      );
      acc.total = acc.receitas - acc.despesas;
      return formatSaldo(acc);
    }
    return null;
  }, [summary, lancamentos]);

  // Paginação
  const PaginationControls = () => {
    if (!pagyInfo || pagyInfo.totalPages <= 1) return null;
    return (
      <div className="pagination-controls" style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12 }}>
        <button onClick={() => setPage(pagyInfo.currentPage - 1)} disabled={pagyInfo.currentPage === 1 || loading}>
          ← Anterior
        </button>
        <span>
          Página {pagyInfo.currentPage} de {pagyInfo.totalPages}
        </span>
        <button onClick={() => setPage(pagyInfo.currentPage + 1)} disabled={pagyInfo.currentPage === pagyInfo.totalPages || loading}>
          Próxima →
        </button>
      </div>
    );
  };

  if (loading) {
    return <p>Carregando lançamentos...</p>;
  }

  if (error) {
    return (
      <div>
        <h1>Financeiro</h1>
        <p style={{ color: "red" }}>Erro ao buscar lançamentos financeiros.</p>
      </div>
    );
  }

  return (
    <div>
      <Toaster position="top-right" />
      {/* Modal de confirmação de exclusão */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Excluir lançamento financeiro?"
        message="Esta ação não pode ser desfeita. Deseja realmente excluir?"
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={() => {
          setIsDeleteModalOpen(false);
          if (deleteTargetId) {
            onDelete(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setDeleteTargetId(null);
        }}
      />
      <h1>Financeiro</h1>

      {/* Filtros */}
      <section style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8, marginBottom: 12 }}>
        <h2 style={{ marginTop: 0 }}>Filtros</h2>
        <div style={{ display: "grid", gridTemplateColumns: isAdmin ? "repeat(4, 1fr)" : "repeat(3, 1fr)", gap: 12 }}>
          <div>
            <label>Tipo</label>
            <select name="tipo" value={filters.tipo} onChange={handleFilterChange}>
              <option value="">Todos</option>
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
            </select>
          </div>
          <div>
            <label>Início</label>
            <input type="date" name="inicio" value={filters.inicio} onChange={handleFilterChange} />
          </div>
          <div>
            <label>Fim</label>
            <input type="date" name="fim" value={filters.fim} onChange={handleFilterChange} />
          </div>
          {isAdmin && (
            <div>
              <label>Responsável (Usuário)</label>
              <select name="usuario_id" value={filters.usuario_id} onChange={handleFilterChange}>
                <option value="">Todos</option>
                {usuarios?.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nome} ({u.login})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div style={{ marginTop: 12 }}>
          <button onClick={applyFilters}>Aplicar filtros</button>
        </div>
      </section>

      {/* Controles de Lista: busca e ordenação */}
      <section style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <label>Buscar por descrição</label>
            <input placeholder="Digite para filtrar..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
          </div>
          <div style={{ minWidth: 240, padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
            <strong>Saldo Geral</strong>
            <div style={{ marginTop: 8, color: saldoGeral >= 0 ? "#0a0" : "#a00" }}>{formatCurrencySigned(saldoGeral)}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => handleSort("data_lancamento")}>Data {sortConfig.key === "data_lancamento" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}</button>
          <button onClick={() => handleSort("valor")}>Valor {sortConfig.key === "valor" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}</button>
        </div>
      </section>

      {/* Resumo de Saldo */}
      {saldoResumoDetalhado && (
        <section style={{ background: "#f6f6f6", padding: 12, borderRadius: 8, marginBottom: 12 }}>
          <strong>Resumo</strong>
          <div style={{ display: "flex", gap: 16 }}>
            <span>Receitas: {saldoResumoDetalhado.receitas}</span>
            <span>Despesas: {saldoResumoDetalhado.despesas}</span>
            <span>Saldo: {saldoResumoDetalhado.total}</span>
          </div>
        </section>
      )}

      {/* Formulário de Criação/Edição */}
      <section style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8, marginBottom: 12 }}>
        <h2 style={{ marginTop: 0 }}>{editingId ? "Editar Lançamento" : "Novo Lançamento"}</h2>
        <form onSubmit={onSubmit} style={{ display: "grid", gridTemplateColumns: isAdmin ? "repeat(4, 1fr)" : "repeat(3, 1fr)", gap: 12 }}>
          <div>
            <label>Descrição</label>
            <input name="descricao" value={formData.descricao} onChange={onFormChange} maxLength={250} />
            <small style={{ display: "block", color: "#666" }}>{(formData.descricao || "").length}/250</small>
          </div>
          <div>
            <label>Valor</label>
            <input type="number" step="0.01" name="valor" value={formData.valor} onChange={onFormChange} required />
          </div>
          <div>
            <label>Tipo</label>
            <select name="tipo" value={formData.tipo} onChange={onFormChange}>
              <option value={0}>Receita</option>
              <option value={1}>Despesa</option>
            </select>
          </div>
          <div>
            <label>Data</label>
            <input type="date" name="data_lancamento" value={formData.data_lancamento} onChange={onFormChange} required />
          </div>
          {isAdmin && (
            <div>
              <label>Responsável (Usuário)</label>
              <select name="usuario_id" value={formData.usuario_id} onChange={onFormChange}>
                <option value="">Selecione...</option>
                {usuarios?.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nome} ({u.login})
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label>Proposta (opcional)</label>
            <input type="number" name="proposta_id" value={formData.proposta_id} onChange={onFormChange} />
          </div>
          <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8 }}>
            <button type="submit">{editingId ? "Salvar" : "Criar"}</button>
            {editingId && (
              <button type="button" onClick={resetForm}>
                Cancelar edição
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Lista */}
      {sortedLancamentos && sortedLancamentos.length > 0 ? (
        <>
          <ul>
            {sortedLancamentos.map((item) => (
              <li key={item.id} style={{ borderBottom: "1px solid #eee", padding: "8px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong>{item.descricao}</strong> — {formatCurrencyBR(item.valor)} — {item.tipo === 0 ? "Receita" : "Despesa"}
                    <div style={{ fontSize: 12, color: "#666" }}>Data: {item.data_lancamento ? new Date(item.data_lancamento).toLocaleDateString() : "-"}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => onEdit(item)}>Editar</button>
                    <button onClick={() => handleDeleteClick(item.id)} style={{ color: "#b00" }}>Excluir</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <PaginationControls />
        </>
      ) : (
        <p>Nenhum lançamento financeiro encontrado.</p>
      )}
    </div>
  );
};

export default Financeiro;
