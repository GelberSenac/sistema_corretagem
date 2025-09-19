import React, { useEffect, useState } from "react";
import "./Dashboard.css";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3000/dashboard_stats")
      .then((response) => response.json())
      .then((data) => {
        setStats(data);
        setCarregando(false);
      })
      .catch((error) => {
        console.error("Erro ao buscar dados do dashboard:", error);
        setCarregando(false);
      });
  }, []);

  if (carregando) {
    return <h1 className="loading-message">Carregando dados...</h1>;
  }

  if (!stats) {
    return <h1>Nenhum dado encontrado.</h1>;
  }

  return (
    <div className="dashboard-container">
      <h2>Dashboard de Usuários</h2>
      <div className="stats-cards">
        <div className="card-item total">
          <h3>Total de Usuários</h3>
          <p>{stats.total}</p>
        </div>
        <div className="card-item active">
          <h3>Usuários Ativos</h3>
          <p>{stats.ativos}</p>
        </div>
        <div className="card-item inactive">
          <h3>Usuários Inativos</h3>
          <p>{stats.inativos}</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
