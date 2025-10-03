import React, { useState, useEffect } from "react";
import { useCRUD } from "../../Ganchos/useCRUD";

const Financeiro = () => {
  const { obter } = useCRUD("lancamento_financeiros");
  const [lancamentos, setLancamentos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLancamentos = async () => {
      try {
        const data = await obter();
        setLancamentos(data);
      } catch (error) {
        console.error("Erro ao buscar lançamentos financeiros:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLancamentos();
  }, [obter]);

  if (loading) {
    return <p>Carregando lançamentos...</p>;
  }

  return (
    <div>
      <h1>Financeiro</h1>
      {lancamentos.length > 0 ? (
        <ul>
          {lancamentos.map((lancamento) => (
            <li key={lancamento.id}>
              {lancamento.descricao} - R$ {lancamento.valor} -{" "}
              {lancamento.tipo === 0 ? "Receita" : "Despesa"}
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhum lançamento financeiro encontrado.</p>
      )}
    </div>
  );
};

export default Financeiro;
