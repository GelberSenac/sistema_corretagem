import React, { useState, useEffect } from "react";
import { useAuth } from "../../../Contextos/AuthContexto";

const initialState = {
  nome: "",
  email: "",
  login: "",
  password: "",
  cpf: "",
  ativo: true,
  role: "corretor",
  endereco_attributes: {
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
  },
  perfil_corretor_attributes: { creci: "", creci_estado: "" },
};

function UsuarioForm({ usuarioSendoEditado, onFormSubmit, onCancelEdit }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState(initialState);
  const [isCorretor, setIsCorretor] = useState(true);

  useEffect(() => {
    if (usuarioSendoEditado) {
      setIsCorretor(usuarioSendoEditado.role === "corretor");
      setFormData({
        ...initialState,
        ...usuarioSendoEditado,
        password: "", // Limpa a senha por segurança ao editar
        endereco_attributes: usuarioSendoEditado.endereco
          ? { ...usuarioSendoEditado.endereco }
          : initialState.endereco_attributes,
        perfil_corretor_attributes: usuarioSendoEditado.perfil_corretor
          ? { ...usuarioSendoEditado.perfil_corretor }
          : initialState.perfil_corretor_attributes,
      });
    } else {
      setFormData(initialState);
      setIsCorretor(true);
    }
  }, [usuarioSendoEditado]);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    const keys = name.split(".");

    if (name === "role") setIsCorretor(value === "corretor");

    if (keys.length > 1) {
      setFormData((prev) => ({
        ...prev,
        [keys[0]]: { ...prev[keys[0]], [keys[1]]: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalFormData = { ...formData };
    if (!isCorretor) {
      delete finalFormData.perfil_corretor_attributes;
    }
    // Remove a senha do formulário se estiver vazia (para não dar erro no update)
    if (finalFormData.password === "") {
      delete finalFormData.password;
    }
    onFormSubmit(finalFormData, usuarioSendoEditado?.id);
  };

  return (
    <div className="formulario-container">
      <h2>
        {usuarioSendoEditado ? "Editar Usuário" : "Adicionar Novo Usuário"}
      </h2>
      <form onSubmit={handleSubmit}>
        <h3>Dados do Usuário</h3>
        <div className="form-group-row">
          <label>
            Nome:{" "}
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleFormChange}
              required
            />
          </label>
          <label>
            Email:{" "}
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleFormChange}
              required
            />
          </label>
        </div>
        <div className="form-group-row">
          <label>
            Login:{" "}
            <input
              type="text"
              name="login"
              value={formData.login}
              onChange={handleFormChange}
              required
            />
          </label>
          <label>
            Senha:{" "}
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleFormChange}
              required={!usuarioSendoEditado}
            />
          </label>
        </div>
        <div className="form-group-row">
          <label>
            CPF:{" "}
            <input
              type="text"
              name="cpf"
              value={formData.cpf}
              onChange={handleFormChange}
              required
            />
          </label>
          {user?.role === "admin" && (
            <label>
              Papel:
              <select
                name="role"
                value={formData.role}
                onChange={handleFormChange}
              >
                <option value="corretor">Corretor</option>
                <option value="admin">Admin</option>
                <option value="gerente">Gerente</option>
              </select>
            </label>
          )}
        </div>
        <div className="form-group-row">
          <label
            style={{ flexDirection: "row", alignItems: "center", gap: "10px" }}
          >
            Ativo:
            <input
              type="checkbox"
              name="ativo"
              checked={formData.ativo}
              onChange={handleFormChange}
            />
          </label>
        </div>

        {isCorretor && (
          <>
            <h3>Perfil do Corretor</h3>
            <div className="form-group-row">
              <label>
                CRECI:{" "}
                <input
                  type="text"
                  name="perfil_corretor_attributes.creci"
                  value={formData.perfil_corretor_attributes.creci}
                  onChange={handleFormChange}
                />
              </label>
              <label>
                Estado do CRECI:{" "}
                <input
                  type="text"
                  name="perfil_corretor_attributes.creci_estado"
                  value={formData.perfil_corretor_attributes.creci_estado}
                  onChange={handleFormChange}
                  maxLength="2"
                />
              </label>
            </div>
          </>
        )}

        <h3>Endereço</h3>
        <div className="form-group-address">
          <label>
            Logradouro:{" "}
            <input
              type="text"
              name="endereco_attributes.logradouro"
              value={formData.endereco_attributes.logradouro}
              onChange={handleFormChange}
            />
          </label>
          <label>
            Número:{" "}
            <input
              type="text"
              name="endereco_attributes.numero"
              value={formData.endereco_attributes.numero}
              onChange={handleFormChange}
            />
          </label>
          <label>
            Complemento:{" "}
            <input
              type="text"
              name="endereco_attributes.complemento"
              value={formData.endereco_attributes.complemento}
              onChange={handleFormChange}
            />
          </label>
          <label>
            Bairro:{" "}
            <input
              type="text"
              name="endereco_attributes.bairro"
              value={formData.endereco_attributes.bairro}
              onChange={handleFormChange}
            />
          </label>
          <label>
            Cidade:{" "}
            <input
              type="text"
              name="endereco_attributes.cidade"
              value={formData.endereco_attributes.cidade}
              onChange={handleFormChange}
            />
          </label>
          <label>
            Estado:{" "}
            <input
              type="text"
              name="endereco_attributes.estado"
              value={formData.endereco_attributes.estado}
              onChange={handleFormChange}
              maxLength="2"
            />
          </label>
          <label>
            CEP:{" "}
            <input
              type="text"
              name="endereco_attributes.cep"
              value={formData.endereco_attributes.cep}
              onChange={handleFormChange}
            />
          </label>
        </div>

        <button type="submit">
          {usuarioSendoEditado ? "Salvar Alterações" : "Salvar Usuário"}
        </button>
        {usuarioSendoEditado && (
          <button type="button" onClick={onCancelEdit}>
            Cancelar
          </button>
        )}
      </form>
    </div>
  );
}

export default UsuarioForm;
