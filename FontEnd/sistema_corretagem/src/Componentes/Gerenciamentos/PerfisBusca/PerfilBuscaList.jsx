import React from "react";
import { FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import { formatCurrencyBR } from "../../Shared/CurrencyInput";

// 1. Recebemos as novas props: 'loading', 'pagyInfo', e 'onPageChange'
function PerfilBuscaList({
  perfis,
  loading,
  onEdit,
  onDelete,
  pagyInfo,
  onPageChange,
}) {
  // 2. Adicionamos o componente de paginação (igual ao dos outros componentes)
  const PaginationControls = () => {
    if (!pagyInfo || pagyInfo.totalPages <= 1) return null;
    return (
      <div className="pagination-controls">
        <button
          onClick={() => onPageChange(pagyInfo.currentPage - 1)}
          disabled={pagyInfo.currentPage === 1 || loading}
        >
          &larr; Anterior
        </button>
        <span>
          Página {pagyInfo.currentPage} de {pagyInfo.totalPages}
        </span>
        <button
          onClick={() => onPageChange(pagyInfo.currentPage + 1)}
          disabled={pagyInfo.currentPage === pagyInfo.totalPages || loading}
        >
          Próxima &rarr;
        </button>
      </div>
    );
  };

  // 3. Melhoramos a lógica de exibição para incluir o estado de 'loading'
  if (loading && perfis.length === 0) {
    return <p>A carregar perfis de busca...</p>;
  }

  if (!loading && perfis.length === 0) {
    return <p>Nenhum perfil de busca cadastrado para este cliente.</p>;
  }

  return (
    <div>
      <h3>Perfis de Busca Salvos ({pagyInfo?.totalCount ?? perfis.length})</h3>

      <PaginationControls />

      <ul className="lista-grid">
        {perfis.map((perfil) => (
          <li key={perfil.id} className="cliente-card">
            {" "}
            {/* Reutilizando o estilo do card de cliente */}
            <div className="card-link">
              {" "}
              {/* Reutilizando a classe para padding e estrutura */}
              <strong>{perfil.titulo_busca}</strong>
              <p>
                Busca por: {perfil.finalidade || perfil.tipo_negocio} até {formatCurrencyBR(perfil.valor_maximo_imovel)}
              </p>
              <p style={{ marginTop: "10px" }}>
                {perfil.quartos_minimo || 0}+ Quartos | {" "}
                {perfil.suites_minimo || 0}+ Suítes | {perfil.vagas_minimo || 0}
                + Vagas
              </p>
            </div>
            <div className="card-actions">
              {" "}
              {/* Reutilizando o estilo das ações */}
              <button
                onClick={() =>
                  alert("Funcionalidade de busca a ser implementada!")
                }
                title="Buscar imóveis com este perfil"
              >
                <FaSearch />
              </button>
              <button onClick={() => onEdit(perfil)} title="Editar Perfil">
                <FaEdit />
              </button>
              <button
                onClick={() => onDelete(perfil.id)}
                title="Excluir Perfil"
              >
                <FaTrash />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <PaginationControls />
    </div>
  );
}

export default PerfilBuscaList;
