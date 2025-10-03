// src/componentes/Gerenciamentos/Usuarios/UsuarioDetalhesPage.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUsuarioById, updateUsuario } from "../../../Servicos/Api";
import { useAuth } from "../../../Contextos/AuthContexto"; // 1. Importa o useAuth para saber o usuário logado
import { toast, Toaster } from "react-hot-toast";
import "./Usuarios.css";

// 2. Função para formatar o CPF (pode ser movida para um arquivo de 'utils')
const formatarCPF = (cpf) => {
  if (!cpf) return "Não informado";
  const cpfLimpo = cpf.toString().replace(/\D/g, "");
  if (cpfLimpo.length !== 11) return cpf; // Retorna o original se não for um CPF completo
  return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

function UsuarioDetalhesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth(); // Pega o usuário logado

  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  // A sua lógica de 'useEffect' e 'handlePasswordReset' já está perfeita.
  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const response = await getUsuarioById(id);
        setUsuario(response.data);
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
        toast.error("Não foi possível carregar os dados do usuário.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsuario();
  }, [id]);

  const handlePasswordReset = async () => {
    if (newPassword.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    try {
      await updateUsuario(id, { password: newPassword });
      toast.success("Senha alterada com sucesso!");
      setIsPasswordModalOpen(false);
      setNewPassword("");
    } catch (error) {
      toast.error("Erro ao alterar a senha.");
    }
  };

  if (loading) return <h1>Carregando perfil...</h1>;
  if (!usuario) return <h1>Usuário não encontrado.</h1>;

  return (
    <div className="detalhes-container">
      <Toaster position="top-right" />
      <button onClick={() => navigate("/usuarios")} className="back-button">
        &larr; Voltar para a lista
      </button>

      <div className="detalhes-header-card">
        <h2>{usuario.nome}</h2>
        <p>
          <strong>Status:</strong>{" "}
          <span className={usuario.ativo ? "status-ativo" : "status-inativo"}>
            {usuario.ativo ? "Ativo" : "Inativo"}
          </span>
        </p>
      </div>

      <div className="detalhes-grid">
        {/* Card de Dados de Acesso */}
        <div className="info-card">
          <h3>Dados de Acesso</h3>
          <p>
            <strong>Email:</strong> {usuario.email}
          </p>
          <p>
            <strong>Login:</strong> {usuario.login}
          </p>
          <p>
            <strong>CPF:</strong> {formatarCPF(usuario.cpf)}
          </p>
          <p>
            <strong>Papel (Role):</strong> {usuario.role}
          </p>
        </div>

        {/* Card de Perfil de Corretor (renderização condicional) */}
        {usuario.perfil_corretor && (
          <div className="info-card">
            <h3>Perfil de Corretor</h3>
            <p>
              <strong>CRECI:</strong> {usuario.perfil_corretor.creci}
            </p>
            <p>
              <strong>Estado do CRECI:</strong>{" "}
              {usuario.perfil_corretor.creci_estado}
            </p>
          </div>
        )}

        {/* Card de Endereço (renderização condicional) */}
        {usuario.endereco && (
          <div className="info-card">
            <h3>Endereço</h3>
            <p>{`${usuario.endereco.logradouro || ""}, ${
              usuario.endereco.numero || ""
            }`}</p>
            <p>{`${usuario.endereco.bairro || ""}, ${
              usuario.endereco.cidade || ""
            } - ${usuario.endereco.estado || ""}`}</p>
            <p>
              <strong>CEP:</strong> {usuario.endereco.cep || "Não informado"}
            </p>
          </div>
        )}
      </div>

      {/* --- MELHORIA DE SEGURANÇA E UI --- */}
      {/* Seção de ações só é visível para administradores */}
      {currentUser?.role === "admin" && (
        <div className="acoes-card">
          <h3>Ações do Administrador</h3>
          <button onClick={() => setIsPasswordModalOpen(true)}>
            Alterar Senha
          </button>
          {/* Outros botões de ação poderiam vir aqui */}
        </div>
      )}

      {/* Modal de Alteração de Senha (inalterado) */}
      {isPasswordModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>Alterar Senha de {usuario.nome}</h3>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Digite a nova senha"
              autoFocus
            />
            <div className="modal-actions">
              <button onClick={handlePasswordReset}>Salvar Nova Senha</button>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="cancel-button"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsuarioDetalhesPage;
