import React, { useState, useEffect } from "react";
import { useCRUD } from "../../Ganchos/useCRUD";

const Agenda = () => {
  const { obter } = useCRUD("agendamentos");
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const buscarAgendamentos = async () => {
      try {
        const data = await obter();
        setAgendamentos(data);
      } catch (error) {
        console.error("Erro ao buscar agendamentos:", error);
      } finally {
        setLoading(false);
      }
    };

    buscarAgendamentos();
  }, [obter]);

  if (loading) {
    return <p>Carregando agendamentos...</p>;
  }

  return (
    <div>
      <h1>Agenda de Compromissos</h1>
      {agendamentos.length > 0 ? (
        <ul>
          {agendamentos.map((agendamento) => (
            <li key={agendamento.id}>
              <strong>{agendamento.titulo}</strong>
              <p>{agendamento.descricao}</p>
              <p>
                Início: {new Date(agendamento.data_inicio).toLocaleString()}
              </p>
              <p>Fim: {new Date(agendamento.data_fim).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhum agendamento encontrado.</p>
      )}
    </div>
  );
};

export default Agenda;
