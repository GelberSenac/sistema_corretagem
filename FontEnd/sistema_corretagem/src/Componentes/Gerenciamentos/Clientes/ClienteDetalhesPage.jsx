// src/componentes/Gerenciamentos/Clientes/ClienteDetalhesPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getClienteById } from "../../../Servicos/Api";
import PerfisBusca from "../PerfisBusca/PerfisBusca";
import { Toaster, toast } from "react-hot-toast";
import "./Clientes.css"; // Vamos assumir que você tem um CSS para estilizar

// --- FUNÇÃO AUXILIAR PARA FORMATAR CPF ---
const formatarCPF = (cpf) => {
  if (!cpf) return "Não informado";
  // Remove qualquer caractere que não seja dígito
  const cpfLimpo = cpf.toString().replace(/\D/g, "");
  // Aplica a máscara
  return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

function ClienteDetalhesPage() {
  const { clienteId } = useParams();
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

      {/* --- Card Principal com Nome e Contatos --- */}
      <div className="detalhes-header-card">
        <h2>{cliente.nome}</h2>
        <p>
          <strong>Email:</strong> {cliente.email || "Não informado"}
        </p>
        <p>
          <strong>Telefone:</strong> {cliente.telefone || "Não informado"}
        </p>
      </div>

      <div className="detalhes-grid">
        {/* --- Card de Dados Pessoais --- */}
        <div className="info-card">
          <h3>Dados Pessoais</h3>
          <p>
            <strong>CPF:</strong> {formatarCPF(cliente.cpf)}
          </p>
          <p>
            <strong>RG:</strong> {cliente.rg || "Não informado"}
          </p>
          <p>
            <strong>Data de Nascimento:</strong>{" "}
            {cliente.data_nascimento
              ? new Date(cliente.data_nascimento).toLocaleDateString("pt-BR")
              : "Não informado"}
          </p>
          <p>
            <strong>Profissão:</strong> {cliente.profissao || "Não informado"}
          </p>
          <p>
            <strong>Estado Civil:</strong>{" "}
            {cliente.estado_civil || "Não informado"}
          </p>
          <p>
            <strong>Renda:</strong>{" "}
            {cliente.renda
              ? `R$ ${cliente.renda.toLocaleString("pt-BR")}`
              : "Não informado"}
          </p>
        </div>

        {/* --- Card de Endereço (só aparece se o endereço existir) --- */}
        {cliente.endereco && (
          <div className="info-card">
            <h3>Endereço</h3>
            <p>{`${cliente.endereco.logradouro}, ${cliente.endereco.numero}`}</p>
            <p>{cliente.endereco.complemento}</p>
            <p>{`${cliente.endereco.bairro}, ${cliente.endereco.cidade} - ${cliente.endereco.estado}`}</p>
            <p>
              <strong>CEP:</strong> {cliente.endereco.cep || "Não informado"}
            </p>
          </div>
        )}

        {/* --- Card do Cônjuge (só aparece se o cônjuge existir) --- */}
        {cliente.conjuge && (
          <div className="info-card">
            <h3>Dados do Cônjuge</h3>
            <p>
              <strong>Nome:</strong> {cliente.conjuge.nome}
            </p>
            <p>
              <strong>CPF:</strong> {formatarCPF(cliente.conjuge.cpf)}
            </p>
            <p>
              <strong>Profissão:</strong>{" "}
              {cliente.conjuge.profissao || "Não informado"}
            </p>
          </div>
        )}
      </div>

      <hr className="section-divider" />

      {/* Componente de Perfis de Busca continua aqui */}
      <PerfisBusca clienteId={cliente.id} />
    </div>
  );
}

export default ClienteDetalhesPage;
