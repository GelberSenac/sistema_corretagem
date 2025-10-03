// src/componentes/Dashboard/Dashboard.jsx

import React, { useEffect, useState } from "react";
import { getDashboardStats } from "../../Servicos/Api";
import { useAuth } from "../../Contextos/AuthContexto";
import { Toaster, toast } from "react-hot-toast";
import StatCard from "./StatCard"; // 1. Importamos o seu novo componente reutilizável
import "./Dashboard.css";

// --- Sub-componente para o Dashboard do Admin (agora mais limpo) ---
const AdminDashboard = ({ data }) => (
  <div className="stats-cards">
    {/* 2. Usamos o StatCard para cada item, passando 'title' e 'value' como props */}
    <StatCard
      title="Total de Usuários"
      value={data.total_usuarios}
      type="total"
    />
    <StatCard title="Corretores" value={data.total_corretores} />
    <StatCard title="Administradores" value={data.total_admins} />
    <StatCard
      title="Imóveis na Base"
      value={data.total_imoveis_cadastrados}
      type="active"
    />
  </div>
);

// --- Sub-componente para o Dashboard do Corretor (também mais limpo) ---
const CorretorDashboard = ({ data }) => (
  <div className="stats-cards">
    <StatCard title="Meus Clientes" value={data.total_clientes} type="total" />
    <StatCard
      title="Meus Imóveis"
      value={data.total_imoveis_agenciados}
      type="active"
    />

    {/* A lógica do map continua a mesma, mas agora renderiza o StatCard */}
    {Object.entries(data.propostas_por_status).map(([status, count]) => (
      <StatCard
        key={status}
        title={`Propostas em "${status.replace("_", " ")}"`}
        value={count}
      />
    ))}
  </div>
);

// --- Componente Principal do Dashboard (lógica de busca inalterada) ---
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

      {/* A lógica de renderização condicional permanece a mesma */}
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
