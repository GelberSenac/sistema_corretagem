// src/componentes/Gerenciamentos/Clientes/ClienteDetalhesPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getClienteById } from "../../../Servicos/Api";
import PerfisBusca from "../PerfisBusca/PerfisBusca"; // Nosso componente de perfis!
import { Toaster, toast } from "react-hot-toast";

function ClienteDetalhesPage() {
  const { clienteId } = useParams(); // Pega o ID da URL
  const navigate = useNavigate();
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        const response = await getClienteById(clienteId);
        setCliente(response.data);
      } catch (error) {
        console.error("Erro ao buscar cliente:", error);
        toast.error("Não foi possível carregar os dados do cliente.");
      } finally {
        setLoading(false);
      }
    };
    fetchCliente();
  }, [clienteId]);

  if (loading) return <h1>Carregando dados do cliente...</h1>;
  if (!cliente) return <h1>Cliente não encontrado.</h1>;

  return (
    <div className="detalhes-container">
      <Toaster position="top-right" />
      <button onClick={() => navigate("/clientes")} className="back-button">
        &larr; Voltar para a lista de clientes
      </button>

      <div className="perfil-card">
        <h2>{cliente.nome}</h2>
        <p>
          <strong>Email:</strong> {cliente.email}
        </p>
        <p>
          <strong>Telefone:</strong> {cliente.telefone}
        </p>
        <p>
          <strong>CPF:</strong> {cliente.cpf}
        </p>
        {/* Adicione outros detalhes do cliente que queira exibir */}
      </div>

      <hr />

      {/* RENDERIZA O COMPONENTE DE PERFIS DE BUSCA, PASSANDO O ID DO CLIENTE */}
      <PerfisBusca clienteId={cliente.id} />
    </div>
  );
}

export default ClienteDetalhesPage;
