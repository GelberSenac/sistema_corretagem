// src/componentes/Gerenciamentos/Usuarios/UsuarioDetalhesPage.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUsuarioById, updateUsuario } from "../../../Servicos/Api";
import { toast, Toaster } from "react-hot-toast";
import "./UsuarioDetalhesPage.css"; // Crie um arquivo CSS para estilizar

function UsuarioDetalhesPage() {
  const { id } = useParams(); // Pega o 'id' da URL (ex: /usuarios/5)
  const navigate = useNavigate(); // Para voltar à lista após alguma ação

  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");

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

      <h2>Perfil de {usuario.nome}</h2>

      <div className="perfil-card">
        <p>
          <strong>Email:</strong> {usuario.email}
        </p>
        <p>
          <strong>Login:</strong> {usuario.login}
        </p>
        <p>
          <strong>CPF:</strong> {usuario.cpf}
        </p>
        <p>
          <strong>Papel:</strong> {usuario.role}
        </p>
        <p>
          <strong>Status:</strong> {usuario.ativo ? "Ativo" : "Inativo"}
        </p>
      </div>

      <div className="acoes-card">
        <h3>Ações do Administrador</h3>
        <button onClick={() => setIsPasswordModalOpen(true)}>
          Alterar Senha
        </button>
        {/* Outros botões de ação poderiam vir aqui */}
      </div>

      {/* Modal de Alteração de Senha */}
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
