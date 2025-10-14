import React, { useState } from "react";
import { useCRUD } from "../../Ganchos/useCRUD";
import { useAuth } from "../../Contextos/AuthContexto";
import { Toaster, toast } from "react-hot-toast";
import { formatApiErrors, normalizeText } from "../../Servicos/ErroUtils";
import ConfirmModal from "../Shared/ConfirmModal";

const statusOptions = [
  { label: "Agendado", value: "agendado" },
  { label: "Concluído", value: "concluido" },
  { label: "Cancelado", value: "cancelado" },
];

const Agenda = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  // Hook principal de Agendamentos com paginação, filtros e CRUD
  const {
    data: agendamentos,
    loading,
    error,
    pagyInfo,
    setPage,
    setFilters,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useCRUD("agendamentos");

  // Hooks auxiliares: sempre chamados; usamos dados conforme papel
  const { data: usuarios } = useCRUD("usuarios");
  const { data: clientes } = useCRUD("clientes");
  const { data: imoveis } = useCRUD("imoveis");

  // --- Estado local do formulário e edição ---
  const initialForm = {
    titulo: "",
    descricao: "",
    data_inicio: "",
    data_fim: "",
    local: "",
    status: "agendado",
    usuario_id: "",
    cliente_id: "",
    imovel_id: "",
  };
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  // Autocomplete/busca dos selects do formulário
  const [formClienteQuery, setFormClienteQuery] = useState("");
  const [formImovelQuery, setFormImovelQuery] = useState("");
  // Esconder dados de outros corretores em selects quando não admin (declarado ANTES dos filtros derivados)
  const clientesVisiveis = React.useMemo(() => {
    if (!Array.isArray(clientes)) return [];
    const base = isAdmin ? clientes : clientes.filter((c) => c.usuario_id === user?.id);
    return [...base].sort((a, b) => (a.nome || "").localeCompare(b.nome || "", 'pt', { sensitivity: 'base' }));
  }, [clientes, isAdmin, user]);
  const imoveisVisiveis = React.useMemo(() => {
    if (!Array.isArray(imoveis)) return [];
    const base = isAdmin ? imoveis : imoveis.filter((i) => i.usuario_id === user?.id);
    return [...base].sort((a, b) => (a.titulo || `Imóvel #${a.id}`).localeCompare(b.titulo || `Imóvel #${b.id}`, 'pt', { sensitivity: 'base' }));
  }, [imoveis, isAdmin, user]);
  const filteredClientesForm = React.useMemo(() => {
    const term = formClienteQuery.trim().toLowerCase();
    const base = clientesVisiveis;
    if (!term) return base;
    return base.filter((c) => (c.nome || "").toLowerCase().includes(term));
  }, [clientesVisiveis, formClienteQuery]);
  const filteredImoveisForm = React.useMemo(() => {
    const term = formImovelQuery.trim().toLowerCase();
    const base = imoveisVisiveis;
    if (!term) return base;
    return base.filter((i) => ((i.titulo || `Imóvel #${i.id}`) || "").toLowerCase().includes(term));
  }, [imoveisVisiveis, formImovelQuery]);

  // --- Estado local para filtros ---
  const [filters, setLocalFilters] = useState({ status: "", cliente_id: "", usuario_id: "", imovel_id: "" });
  // Restaura funções de filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({ ...prev, [name]: value }));
  };
  const applyFilters = () => {
    const payload = { ...filters };
    if (!payload.status) delete payload.status;
    if (!payload.cliente_id) delete payload.cliente_id;
    if (!payload.imovel_id) delete payload.imovel_id;
    if (!isAdmin) {
      payload.usuario_id = user?.id;
    } else {
      if (!payload.usuario_id) delete payload.usuario_id;
    }
    setFilters(payload);
  };
  // Busca/autocomplete para selects de filtros
  const [filtroClienteQuery, setFiltroClienteQuery] = useState("");
  const [filtroImovelQuery, setFiltroImovelQuery] = useState("");

  // --- Busca por texto e ordenação no front ---
  const [searchText, setSearchText] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key ? { key, direction: prev.direction === "asc" ? "desc" : "asc" } : { key, direction: "asc" }
    );
  };

  // Esconder dados de outros corretores em selects quando não admin
  // DUPLICATED BLOCK REMOVED: clientesVisiveis & imoveisVisiveis already declared earlier
  // const clientesVisiveis = React.useMemo(() => { ... });
  // const imoveisVisiveis = React.useMemo(() => { ... });

  const filteredClientesFiltros = React.useMemo(() => {
    const term = filtroClienteQuery.trim().toLowerCase();
    const base = clientesVisiveis;
    if (!term) return base;
    return base.filter((c) => (c.nome || "").toLowerCase().includes(term));
  }, [clientesVisiveis, filtroClienteQuery]);
  const filteredImoveisFiltros = React.useMemo(() => {
    const term = filtroImovelQuery.trim().toLowerCase();
    const base = imoveisVisiveis;
    if (!term) return base;
    return base.filter((i) => ((i.titulo || `Imóvel #${i.id}`) || "").toLowerCase().includes(term));
  }, [imoveisVisiveis, filtroImovelQuery]);

  const filteredAgendamentos = React.useMemo(() => {
    const term = searchText.trim().toLowerCase();
    let items = Array.isArray(agendamentos) ? agendamentos : [];
    if (term) {
      items = items.filter((i) => ((i.titulo || "") + " " + (i.descricao || "")).toLowerCase().includes(term));
    }
    if (!isAdmin) {
      items = items.filter((i) => i.usuario_id === user?.id);
    }
    return items;
  }, [agendamentos, searchText, isAdmin, user]);
  const sortedAgendamentos = React.useMemo(() => {
    const items = [...filteredAgendamentos];
    if (!sortConfig.key) return items;
    items.sort((a, b) => {
      let av = 0;
      let bv = 0;
      if (sortConfig.key === "data_inicio") {
        av = a.data_inicio ? new Date(a.data_inicio).getTime() : 0;
        bv = b.data_inicio ? new Date(b.data_inicio).getTime() : 0;
      } else if (sortConfig.key === "status") {
        // Mapear status para ordem simples: agendado < concluido < cancelado
        const order = { agendado: 0, concluido: 1, cancelado: 2 };
        av = order[a.status] ?? 0;
        bv = order[b.status] ?? 0;
      }
      return sortConfig.direction === "asc" ? av - bv : bv - av;
    });
    return items;
  }, [filteredAgendamentos, sortConfig]);

  const onFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditingId(null);
    setFormClienteQuery("");
    setFormImovelQuery("");
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
      // Validar presença e ordem de datas: data_fim > data_inicio
      if (!payload.data_inicio || !payload.data_fim) {
        alert("Informe início e fim do agendamento.");
        return;
      }
      const inicio = new Date(payload.data_inicio);
      const fim = new Date(payload.data_fim);
      if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
        alert("Datas inválidas. Verifique os campos de início e fim.");
        return;
      }
      if (fim.getTime() <= inicio.getTime()) {
        alert("A data/hora de fim deve ser posterior à de início.");
        return;
      }
      // Validar/normalizar campo local obrigatório com trim e colapso de espaços
      payload.local = normalizeText(payload.local || "");
      if (!payload.local) {
        alert("O campo 'Local' é obrigatório.");
        return;
      }
      if (payload.local.length < 3) {
        alert("O campo 'Local' deve ter pelo menos 3 caracteres (desconsiderando espaços extras).");
        return;
      }

      // Normalizações de campos opcionais
      if (!payload.descricao) delete payload.descricao;
      if (!payload.cliente_id) delete payload.cliente_id;
      if (!payload.imovel_id) delete payload.imovel_id;
      // Garantir usuario_id para não-admin
      if (!isAdmin) {
        payload.usuario_id = user?.id;
      }

      if (editingId) {
        await handleUpdate(editingId, payload);
        toast.success("Agendamento atualizado com sucesso!");
      } else {
        await handleCreate(payload);
        toast.success("Agendamento criado com sucesso!");
      }
      resetForm();
    } catch (err) {
      const mensagem = formatApiErrors(err);
      toast.error(mensagem);
      console.error("[Agenda] Erro ao salvar agendamento", { err });
    }
  };

  const onEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      titulo: item.titulo || "",
      descricao: item.descricao || "",
      data_inicio: (item.data_inicio || "").slice(0, 16), // "YYYY-MM-DDTHH:MM"
      data_fim: (item.data_fim || "").slice(0, 16),
      local: item.local || "",
      status: item.status || "agendado",
      usuario_id: item.usuario_id || "",
      cliente_id: item.cliente_id || "",
      imovel_id: item.imovel_id || "",
    });
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const handleDeleteClick = (id) => {
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };
  const onDelete = async (id) => {
    try {
      await handleDelete(id);
      if (editingId === id) resetForm();
      toast.success("Agendamento excluído com sucesso!");
    } catch (err) {
      const status = err?.response?.status;
      const mensagem = status === 403
        ? "Você não tem permissão para excluir este agendamento."
        : status === 500
          ? "Erro interno no servidor ao excluir o agendamento."
          : "Ocorreu um erro ao excluir o agendamento.";
      toast.error(mensagem);
      console.error("[Agenda] Erro ao excluir agendamento", { status, err });
    }
  };

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
    return <p>Carregando agendamentos...</p>;
  }

  // Render principal da página
  return (
      <div>
        <Toaster position="top-right" />
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          title="Excluir agendamento?"
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
        <h1>Agenda de Compromissos</h1>

          {/* Filtros */}
          <section style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8, marginBottom: 12 }}>
            <h2 style={{ marginTop: 0 }}>Filtros</h2>
            <div style={{ display: "grid", gridTemplateColumns: isAdmin ? "repeat(4, 1fr)" : "repeat(3, 1fr)", gap: 12 }}>
              <div>
                <label>Status</label>
                <select name="status" value={filters.status} onChange={handleFilterChange}>
                  <option value="">Todos</option>
                  {statusOptions.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Cliente</label>
                <input type="text" placeholder="Buscar cliente..." value={filtroClienteQuery} onChange={(e) => setFiltroClienteQuery(e.target.value)} />
                <select name="cliente_id" value={filters.cliente_id} onChange={handleFilterChange}>
                  <option value="">Todos</option>
                  {filteredClientesFiltros?.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>
              {isAdmin && (
                <div>
                  <label>Responsável (Usuário)</label>
                  <select name="usuario_id" value={filters.usuario_id} onChange={handleFilterChange}>
                    <option value="">Todos</option>
                    {usuarios?.map((u) => (
                      <option key={u.id} value={u.id}>{u.nome} ({u.login})</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label>Imóvel</label>
                <input type="text" placeholder="Buscar imóvel..." value={filtroImovelQuery} onChange={(e) => setFiltroImovelQuery(e.target.value)} />
                <select name="imovel_id" value={filters.imovel_id} onChange={handleFilterChange}>
                  <option value="">Todos</option>
                  {filteredImoveisFiltros?.map((i) => (
                    <option key={i.id} value={i.id}>{i.titulo || `Imóvel #${i.id}`}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <button onClick={applyFilters}>Aplicar filtros</button>
            </div>
          </section>

          {/* Controles de Lista: busca e ordenação */}
          <section style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
            <input
              type="text"
              placeholder="Buscar por título/descrição..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ flex: 1 }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => handleSort("data_inicio")}>Data {sortConfig.key === "data_inicio" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}</button>
              <button onClick={() => handleSort("status")}>Status {sortConfig.key === "status" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}</button>
            </div>
          </section>

          {/* Formulário de Criação/Edição */}
          <section style={{ border: editingId ? "2px solid #2a66bb" : "1px solid #ddd", background: editingId ? "#e8f0ff" : undefined, padding: 12, borderRadius: 8, marginBottom: 12 }}>
            <h2 style={{ marginTop: 0 }}>
              {editingId ? "Editar Agendamento" : "Novo Agendamento"}
              {editingId && (
                <span style={{ marginLeft: 8, fontSize: 12, color: "#2a66bb", background: "#dbe8ff", padding: "2px 6px", borderRadius: 4 }}>Modo edição</span>
              )}
            </h2>
            <form onSubmit={onSubmit} style={{ display: "grid", gridTemplateColumns: isAdmin ? "repeat(4, 1fr)" : "repeat(3, 1fr)", gap: 12 }}>
              <div>
                <label>Título</label>
                <input name="titulo" value={formData.titulo} onChange={onFormChange} required />
              </div>
              <div>
                <label>Descrição</label>
                <input name="descricao" value={formData.descricao} onChange={onFormChange} maxLength={250} />
                <small style={{ display: "block", color: "#666" }}>{(formData.descricao || "").length}/250</small>
              </div>
              <div>
                <label>Local</label>
                <input name="local" value={formData.local} onChange={onFormChange} required />
              </div>
              <div>
                <label>Início</label>
                <input type="datetime-local" name="data_inicio" value={formData.data_inicio} onChange={onFormChange} required />
              </div>
              <div>
                <label>Fim</label>
                <input type="datetime-local" name="data_fim" value={formData.data_fim} onChange={onFormChange} required />
              </div>
              <div>
                <label>Status</label>
                <select name="status" value={formData.status} onChange={onFormChange}>
                  {statusOptions.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              {isAdmin && (
                <div>
                  <label>Responsável (Usuário)</label>
                  <select name="usuario_id" value={formData.usuario_id} onChange={onFormChange}>
                    <option value="">Selecione...</option>
                    {usuarios?.map((u) => (
                      <option key={u.id} value={u.id}>{u.nome} ({u.login})</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label>Cliente</label>
                <input type="text" placeholder="Buscar cliente..." value={formClienteQuery} onChange={(e) => setFormClienteQuery(e.target.value)} />
                <select name="cliente_id" value={formData.cliente_id} onChange={onFormChange}>
                  <option value="">Selecione...</option>
                  {filteredClientesForm?.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Imóvel</label>
                <input type="text" placeholder="Buscar imóvel..." value={formImovelQuery} onChange={(e) => setFormImovelQuery(e.target.value)} />
                <select name="imovel_id" value={formData.imovel_id} onChange={onFormChange}>
                  <option value="">Selecione...</option>
                  {filteredImoveisForm?.map((i) => (
                    <option key={i.id} value={i.id}>{i.titulo || `Imóvel #${i.id}`}</option>
                  ))}
                </select>
              </div>
              <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8 }}>
                <button type="submit">{editingId ? "Salvar" : "Criar"}</button>
                {editingId && (
                  <button type="button" onClick={resetForm}>Cancelar edição</button>
                )}
              </div>
            </form>
          </section>

          {/* Lista */}
          {sortedAgendamentos && sortedAgendamentos.length > 0 ? (
            <>
              <ul>
                {sortedAgendamentos.map((item) => (
                  <li key={item.id} style={{ borderBottom: "1px solid #eee", padding: "8px 0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <strong>{item.titulo}</strong> — {item.status}
                        <div style={{ fontSize: 12, color: "#666" }}>
                          Início: {item.data_inicio ? new Date(item.data_inicio).toLocaleString() : "-"} | Fim: {item.data_fim ? new Date(item.data_fim).toLocaleString() : "-"}
                        </div>
                        {item.local ? <div style={{ fontSize: 12, color: "#666" }}>Local: {item.local}</div> : null}
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
            <p>Nenhum agendamento encontrado.</p>
          )}
        </div>
      );
};

export default Agenda;
