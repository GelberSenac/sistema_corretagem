import React, { useState, useEffect } from "react";
import { useCRUD } from "../../Ganchos/useCRUD";

const Relatorios = () => {
  const { obter } = useCRUD("relatorios/propostas_por_status");
  const [relatorio, setRelatorio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatorio = async () => {
      try {
        const data = await obter();
        setRelatorio(data);
      } catch (error) {
        console.error("Erro ao buscar relatório de propostas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatorio();
  }, [obter]);

  if (loading) {
    return <p>Carregando relatório...</p>;
  }

  return (
    <div>
      <h1>Relatórios</h1>
      <h2>Propostas por Status</h2>
      {relatorio ? (
        <ul>
          {Object.entries(relatorio).map(([status, contagem]) => (
            <li key={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}: {contagem}
            </li>
          ))}
        </ul>
      ) : (
        <p>Não foi possível gerar o relatório.</p>
      )}
    </div>
  );
};

export default Relatorios;
