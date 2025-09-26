import React, { useEffect, useState } from "react";
import { getDashboardStats } from "../../Servicos/Api";
import { useAuth } from "../../Contextos/AuthContexto";
import "./Dashboard.css";
import { Toaster, toast } from "react-hot-toast";

// --- Sub-componente para o Dashboard do Admin ---
const AdminDashboard = ({ data }) => (
  <div className="stats-cards">
    <div className="card-item total">
      <h3>Total de Usuários</h3>
      <p>{data.total_usuarios}</p>
    </div>
    <div className="card-item">
      <h3>Corretores</h3>
      <p>{data.total_corretores}</p>
    </div>
    <div className="card-item">
      <h3>Administradores</h3>
      <p>{data.total_admins}</p>
    </div>
    {/* --- NOVO CARD ADICIONADO --- */}
    <div className="card-item active">
      <h3>Imóveis na Base</h3>
      <p>{data.total_imoveis_cadastrados}</p>
    </div>
  </div>
);

// --- Sub-componente para o Dashboard do Corretor ---
const CorretorDashboard = ({ data }) => (
  <div className="stats-cards">
    <div className="card-item total">
      <h3>Meus Clientes</h3>
      <p>{data.total_clientes}</p>
    </div>
    {/* --- NOVO CARD ADICIONADO --- */}
    <div className="card-item active">
      <h3>Meus Imóveis</h3>
      <p>{data.total_imoveis_agenciados}</p>
    </div>
    {/* Mapeia dinamicamente os status das propostas */}
    {Object.entries(data.propostas_por_status).map(([status, count]) => (
      <div className="card-item" key={status}>
        <h3>Propostas em "{status.replace("_", " ")}"</h3>
        <p>{count}</p>
      </div>
    ))}
  </div>
);

// --- Componente Principal do Dashboard ---
function Dashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await getDashboardStats();
        setDashboardData(response.data);
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
        toast.error("Não foi possível carregar os dados do dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <h1 className="loading-message">Carregando dashboard...</h1>;
  }

  if (!dashboardData) {
    return <h1>Nenhum dado para exibir.</h1>;
  }

  return (
    <div className="dashboard-container">
      <Toaster position="top-right" />
      <h2>
        Dashboard de {user?.role === "admin" ? "Administrador" : "Corretor"}
      </h2>
      {dashboardData.tipo_dashboard === "admin" && (
        <AdminDashboard data={dashboardData} />
      )}
      {dashboardData.tipo_dashboard === "corretor" && (
        <CorretorDashboard data={dashboardData} />
      )}
    </div>
  );
}

export default Dashboard;
