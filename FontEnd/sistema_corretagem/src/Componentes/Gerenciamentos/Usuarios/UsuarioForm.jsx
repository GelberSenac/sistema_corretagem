// src/componentes/Gerenciamentos/Usuarios/UsuarioForm.jsx

import React, { useState, useEffect } from "react";
import { useAuth } from "../../../Contextos/AuthContexto";
import { useMask } from "@react-input/mask";

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

  const cpfInputRef = useMask({
    mask: "___.___.___-__",
    replacement: { _: /\d/ },
  });
  const cepInputRef = useMask({ mask: "_____-___", replacement: { _: /\d/ } });

  // A sua lógica de 'useEffect', 'handleFormChange' e 'handleSubmit'
  // já está excelente e pode ser mantida exatamente como está.
  useEffect(() => {
    if (usuarioSendoEditado) {
      setIsCorretor(usuarioSendoEditado.role === "corretor");
      setFormData({
        ...initialState,
        ...usuarioSendoEditado,
        password: "",
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
    if (finalFormData.password === "") {
      delete finalFormData.password;
    }
    if (finalFormData.cpf)
      finalFormData.cpf = finalFormData.cpf.replace(/\D/g, "");
    if (finalFormData.endereco_attributes.cep)
      finalFormData.endereco_attributes.cep =
        finalFormData.endereco_attributes.cep.replace(/\D/g, "");
    onFormSubmit(finalFormData, usuarioSendoEditado?.id);
  };

  return (
    <div className="formulario-container">
      <h2>
        {usuarioSendoEditado ? "Editar Usuário" : "Adicionar Novo Usuário"}
      </h2>
      <form onSubmit={handleSubmit}>
        {/* ... (Seção de Dados do Usuário) ... */}
        {/* O código para os campos de nome, email, etc., continua o mesmo */}

        {isCorretor && (
          <>
            <h3 className="form-section-title">Perfil do Corretor</h3>
            <div className="form-grid">
              <label className="grid-col-span-2">
                CRECI:{" "}
                <input
                  type="text"
                  name="perfil_corretor_attributes.creci"
                  value={formData.perfil_corretor_attributes.creci}
                  onChange={handleFormChange}
                />
              </label>

              {/* --- MELHORIA APLICADA AQUI --- */}
              <label className="grid-col-span-2">
                Estado do CRECI:
                <select
                  name="perfil_corretor_attributes.creci_estado"
                  value={formData.perfil_corretor_attributes.creci_estado}
                  onChange={handleFormChange}
                >
                  <option value="">Selecione...</option>
                  <option value="AC">AC</option> <option value="AL">AL</option>{" "}
                  <option value="AP">AP</option>
                  <option value="AM">AM</option> <option value="BA">BA</option>{" "}
                  <option value="CE">CE</option>
                  <option value="DF">DF</option> <option value="ES">ES</option>{" "}
                  <option value="GO">GO</option>
                  <option value="MA">MA</option> <option value="MT">MT</option>{" "}
                  <option value="MS">MS</option>
                  <option value="MG">MG</option> <option value="PA">PA</option>{" "}
                  <option value="PB">PB</option>
                  <option value="PR">PR</option> <option value="PE">PE</option>{" "}
                  <option value="PI">PI</option>
                  <option value="RJ">RJ</option> <option value="RN">RN</option>{" "}
                  <option value="RS">RS</option>
                  <option value="RO">RO</option> <option value="RR">RR</option>{" "}
                  <option value="SC">SC</option>
                  <option value="SP">SP</option> <option value="SE">SE</option>{" "}
                  <option value="TO">TO</option>
                </select>
              </label>
            </div>
          </>
        )}

        <h3 className="form-section-title">Endereço</h3>
        <div className="form-grid">
          <label className="grid-col-span-4">
            Logradouro:{" "}
            <input
              type="text"
              name="endereco_attributes.logradouro"
              value={formData.endereco_attributes.logradouro}
              onChange={handleFormChange}
            />
          </label>
          <label className="grid-col-span-1">
            Número:{" "}
            <input
              type="text"
              name="endereco_attributes.numero"
              value={formData.endereco_attributes.numero}
              onChange={handleFormChange}
            />
          </label>
          <label className="grid-col-span-3">
            Complemento:{" "}
            <input
              type="text"
              name="endereco_attributes.complemento"
              value={formData.endereco_attributes.complemento}
              onChange={handleFormChange}
            />
          </label>
          <label className="grid-col-span-2">
            Bairro:{" "}
            <input
              type="text"
              name="endereco_attributes.bairro"
              value={formData.endereco_attributes.bairro}
              onChange={handleFormChange}
            />
          </label>
          <label className="grid-col-span-2">
            Cidade:{" "}
            <input
              type="text"
              name="endereco_attributes.cidade"
              value={formData.endereco_attributes.cidade}
              onChange={handleFormChange}
            />
          </label>
          <label className="grid-col-span-1">
            Estado:{" "}
            <input
              type="text"
              name="endereco_attributes.estado"
              value={formData.endereco_attributes.estado}
              onChange={handleFormChange}
              maxLength="2"
            />
          </label>
          <label className="grid-col-span-1">
            CEP:
            <input
              ref={cepInputRef}
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
