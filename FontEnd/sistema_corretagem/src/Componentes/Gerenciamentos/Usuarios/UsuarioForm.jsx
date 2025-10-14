// src/componentes/Gerenciamentos/Usuarios/UsuarioForm.jsx

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../Contextos/AuthContexto";
import { useMask } from "@react-input/mask";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "react-hot-toast";
import AddressForm from "../../Shared/AddressForm";
import ConfirmModal from "../../Shared/ConfirmModal";

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

function UsuarioForm({ usuarioSendoEditado, onFormSubmit, onCancelEdit, resetSignal }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState(initialState);
  const [isCorretor, setIsCorretor] = useState(true);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  // Controle de estado sujo para alerta de saída sem salvar
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  // Declarar o ref DENTRO do componente
  const firstFieldRef = useRef(null);

  const cpfInputRef = useMask({
    mask: "___.___.___-__",
    replacement: { _: /\d/ },
  });
  const cepInputRef = useMask({ mask: "_____-___", replacement: { _: /\d/ } });

  useEffect(() => {
    // Quando receber um sinal de reset (criação contínua), limpa o formulário
    if (!usuarioSendoEditado && resetSignal > 0) {
      setFormData(initialState);
      setErrors({});
      setIsCorretor(true);
      setIsDirty(false);
      setShowPassword(false);
    }
  }, [resetSignal, usuarioSendoEditado]);

  useEffect(() => {
    if (firstFieldRef.current) {
      setTimeout(() => firstFieldRef.current?.focus(), 0);
    }
  }, [resetSignal, usuarioSendoEditado]);

  // Ajusta dados do formulário ao alternar entre edição e criação
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
      setErrors({});
      setIsDirty(false);
    } else {
      setFormData(initialState);
      setIsCorretor(true);
      setErrors({});
      setIsDirty(false);
    }
  }, [usuarioSendoEditado]);

  // Busca automática de endereço pelo CEP (quando completar 8 dígitos)
  useEffect(() => {
    const cepDigits = (formData.endereco_attributes.cep || "").replace(/\D/g, "");
    if (cepDigits.length !== 8) return;

    const controller = new AbortController();
    (async () => {
      try {
        const resp = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`, { signal: controller.signal });
        const data = await resp.json();
        if (data?.erro) {
          toast.error("CEP não encontrado.");
          return;
        }
        setFormData((prev) => ({
          ...prev,
          endereco_attributes: {
            ...prev.endereco_attributes,
            logradouro: data.logradouro || prev.endereco_attributes.logradouro,
            bairro: data.bairro || prev.endereco_attributes.bairro,
            cidade: data.localidade || prev.endereco_attributes.cidade,
            estado: (data.uf || prev.endereco_attributes.estado || "").toUpperCase().slice(0, 2),
          },
        }));
      } catch (err) {
        if (err.name !== "AbortError") {
          toast.error("Erro ao buscar CEP.");
        }
      }
    })();
    return () => controller.abort();
  }, [formData.endereco_attributes.cep]);

    const handleFormChange = (e) => {
      const { name, value, type, checked } = e.target;
      const keys = name.split(".");
      if (name === "role") setIsCorretor(value === "corretor");
  
      // Limpa erro do campo obrigatório ao digitar
      if (["login", "email", "password"].includes(name)) {
        setErrors((prev) => {
          const { [name]: _omit, ...rest } = prev;
          return rest;
        });
      }
  
      const transformedValue =
        name === "endereco_attributes.estado"
          ? (value || "").toUpperCase().slice(0, 2)
          : value;
  
      if (keys.length > 1) {
        setFormData((prev) => ({
          ...prev,
          [keys[0]]: { ...prev[keys[0]], [keys[1]]: transformedValue },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: type === "checkbox" ? checked : transformedValue,
        }));
      }
      setIsDirty(true);
    };
  
    const handleSubmit = async (e, options = {}) => {
      e.preventDefault();
      if (!validateForm()) return;
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
  
      try {
        setIsSubmitting(true);
        await onFormSubmit(finalFormData, usuarioSendoEditado?.id, options);
        setIsDirty(false);
      } finally {
        setIsSubmitting(false);
      }
    };
  
    const handleClose = () => {
      if (isDirty && !isSubmitting) {
        setIsCloseModalOpen(true);
        return;
      }
      onCancelEdit();
    };
  
    const validateForm = () => {
      const newErrors = {};
      const isCreating = !usuarioSendoEditado;
  
      if (!formData.login || !formData.login.trim()) {
        newErrors.login = "Informe o login.";
      }
      if (!formData.email || !formData.email.trim()) {
        newErrors.email = "Informe o e-mail.";
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          newErrors.email = "Informe um e-mail válido.";
        }
      }
      if (isCreating) {
        if (!formData.password || !formData.password.trim()) {
          newErrors.password = "Informe a senha.";
        } else if (formData.password.length < 6) {
          newErrors.password = "A senha deve ter pelo menos 6 caracteres.";
        }
      }
  
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
  
    return (
      <div className="formulario-container">
        <h2>
          {usuarioSendoEditado ? "Editar Usuário" : "Adicionar Novo Usuário"}
        </h2>
        <form onSubmit={handleSubmit} noValidate>
          <h3 className="form-section-title">Dados do Usuário</h3>
          <div className="form-grid">
            <label className="grid-col-span-2">
              Nome:
              <input
                ref={firstFieldRef}
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleFormChange}
              />
            </label>
  
            <label className="grid-col-span-2">
              Email:
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                className={errors.email ? "input-error" : ""}
              />
              {errors.email && (
                <span className="field-error">{errors.email}</span>
              )}
            </label>
  
            {/* Linha 2: CPF, Login, Senha, Papel */}
            <label className="grid-col-span-1">
              CPF:
              <input
                ref={cpfInputRef}
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleFormChange}
              />
            </label>
  
            <label className="grid-col-span-1">
              Login:
              <input
                type="text"
                name="login"
                value={formData.login}
                onChange={handleFormChange}
                className={errors.login ? "input-error" : ""}
              />
              {errors.login && (
                <span className="field-error">{errors.login}</span>
              )}
            </label>
  
            <label className="grid-col-span-1">
              Senha:
              <div className="password-field-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  placeholder={
                    usuarioSendoEditado ? "Deixe em branco para não alterar" : ""
                  }
                  className={errors.password ? "input-error" : ""}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && (
                <span className="field-error">{errors.password}</span>
              )}
            </label>
  
            <label className="grid-col-span-1">
              Papel:
              <select
                name="role"
                value={formData.role}
                onChange={handleFormChange}
              >
                <option value="admin">admin</option>
                <option value="gerente">gerente</option>
                <option value="corretor">corretor</option>
              </select>
            </label>
  
            {/* Linha 3: Ativo */}
            <label className="grid-col-span-1">
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
          <AddressForm
            address={formData.endereco_attributes}
            onFieldChange={(e) => handleFormChange(e)}
            gridClass="form-grid"
          />
  
          <div className="form-actions">
            <button type="submit" disabled={isSubmitting}>
              {usuarioSendoEditado ? "Salvar Alterações" : "Salvar Usuário"}
            </button>
            {!usuarioSendoEditado && (
              <button
                type="button"
                onClick={(e) => handleSubmit(e, { continueCreating: true })}
                disabled={isSubmitting}
                title="Salva e mantém o formulário para cadastrar outro"
              >
                Salvar e cadastrar outro
              </button>
            )}
            <button type="button" onClick={handleClose} disabled={isSubmitting}>
              {usuarioSendoEditado ? "Cancelar" : "Fechar"}
            </button>
          </div>
        </form>
      {/* Modal de confirmação de fechamento */}
      <ConfirmModal
        isOpen={isCloseModalOpen}
        title="Descartar alterações?"
        message="Existem alterações não salvas. Deseja realmente fechar?"
        confirmLabel={usuarioSendoEditado ? "Cancelar edição" : "Fechar formulário"}
        cancelLabel="Continuar editando"
        onConfirm={() => {
          setIsCloseModalOpen(false);
          onCancelEdit();
          setIsDirty(false);
        }}
        onCancel={() => setIsCloseModalOpen(false)}
      />
      </div>
    );
  };

  export default UsuarioForm;
