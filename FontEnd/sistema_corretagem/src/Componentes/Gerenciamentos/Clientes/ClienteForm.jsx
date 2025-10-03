import React, { useState, useEffect } from "react";
import { useMask } from "@react-input/mask";

const initialState = {
  nome: "",
  rg: "",
  cpf: "",
  sexo: "M",
  email: "",
  telefone: "",
  data_nascimento: "",
  estado_civil: "",
  profissao: "",
  renda: "",
  nacionalidade: "",
  data_casamento: "",
  regime_bens: "",
  endereco_attributes: {
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
  },
  conjuge_attributes: {
    nome: "",
    data_nascimento: "",
    cpf: "",
    rg: "",
    profissao: "",
    renda: "",
    email: "",
    celular: "",
    nacionalidade: "",
    data_casamento: "",
    regime_bens: "",
  },
};

function ClienteForm({ clienteSendoEditado, onFormSubmit, onCancelEdit }) {
  const [formData, setFormData] = useState(initialState);
  const [mostrarConjuge, setMostrarConjuge] = useState(false);

  const cpfClienteRef = useMask({ mask: "___.___.___-__", replacement: { _: /\d/ } });
  const cepRef = useMask({ mask: "_____-___", replacement: { _: /\d/ } });
  const cpfConjugeRef = useMask({ mask: "___.___.___-__", replacement: { _: /\d/ } });

  useEffect(() => {
    if (clienteSendoEditado) {
      const temConjuge = !!clienteSendoEditado.conjuge;
      setMostrarConjuge(temConjuge);
      setFormData({
        ...initialState,
        ...clienteSendoEditado,
        data_nascimento: clienteSendoEditado.data_nascimento?.split("T")[0] || "",
        data_casamento: clienteSendoEditado.data_casamento?.split("T")[0] || "",
        endereco_attributes: clienteSendoEditado.endereco ? { ...clienteSendoEditado.endereco } : initialState.endereco_attributes,
        conjuge_attributes: clienteSendoEditado.conjuge
          ? {
              ...initialState.conjuge_attributes,
              ...clienteSendoEditado.conjuge,
              data_nascimento: clienteSendoEditado.conjuge.data_nascimento?.split("T")[0] || "",
              data_casamento: clienteSendoEditado.conjuge.data_casamento?.split("T")[0] || "",
            }
          : initialState.conjuge_attributes,
      });
    } else {
      setFormData(initialState);
      setMostrarConjuge(false);
    }
  }, [clienteSendoEditado]);
  
    useEffect(() => {
    // Se o estado civil não for 'casado' ou 'uniao_estavel', limpa os dados do cônjuge
    if (formData.estado_civil !== 'casado' && formData.estado_civil !== 'uniao_estavel') {
      setMostrarConjuge(false);
      setFormData(prev => ({
        ...prev,
        conjuge_attributes: initialState.conjuge_attributes,
        data_casamento: '',
        regime_bens: ''
      }));
    } else {
      setMostrarConjuge(true);
    }
  }, [formData.estado_civil]);

  useEffect(() => {
    const rendaCliente = parseFloat(formData.renda) || 0;
    const rendaConjuge = parseFloat(formData.conjuge_attributes.renda) || 0;
    const total = rendaCliente + rendaConjuge;
    setFormData(prev => ({ ...prev, renda_familiar_total: total.toFixed(2) }));
  }, [formData.renda, formData.conjuge_attributes.renda]);


  const handleFormChange = (e) => {
    const { name, value } = e.target;
    const keys = name.split(".");
    if (keys.length > 1) {
      setFormData((prev) => ({
        ...prev,
        [keys[0]]: { ...prev[keys[0]], [keys[1]]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let finalFormData = { ...formData };
    if (!mostrarConjuge) {
      delete finalFormData.conjuge_attributes;
    }
    if (finalFormData.cpf) finalFormData.cpf = finalFormData.cpf.replace(/\D/g, "");
    if (finalFormData.endereco_attributes.cep) finalFormData.endereco_attributes.cep = finalFormData.endereco_attributes.cep.replace(/\D/g, "");
    if (finalFormData.conjuge_attributes && finalFormData.conjuge_attributes.cpf) {
      finalFormData.conjuge_attributes.cpf = finalFormData.conjuge_attributes.cpf.replace(/\D/g, "");
    }
    onFormSubmit(finalFormData, clienteSendoEditado?.id);
  };

  return (
    <div className="formulario-container">
      <h2>{clienteSendoEditado ? "Editar Cliente" : "Adicionar Novo Cliente"}</h2>
      <form onSubmit={handleSubmit}>
        <h3 className="form-section-title">Dados Pessoais</h3>
        <div className="form-grid">
          <label className="grid-col-span-2">Nome: <input type="text" name="nome" value={formData.nome} onChange={handleFormChange} required /></label>
          <label>RG: <input type="text" name="rg" value={formData.rg} onChange={handleFormChange} /></label>
          <label>CPF: <input type="text" name="cpf" ref={cpfClienteRef} value={formData.cpf} onChange={handleFormChange} required /></label>
          <label>Email: <input type="email" name="email" value={formData.email} onChange={handleFormChange} required /></label>
          <label>Telefone: <input type="tel" name="telefone" value={formData.telefone} onChange={handleFormChange} required /></label>
          <label>Data de Nascimento: <input type="date" name="data_nascimento" value={formData.data_nascimento} onChange={handleFormChange} required /></label>
          <label>Nacionalidade: <input type="text" name="nacionalidade" value={formData.nacionalidade} onChange={handleFormChange} /></label>
          <label>Profissão: <input type="text" name="profissao" value={formData.profissao} onChange={handleFormChange} required /></label>
          <label>Renda: <input type="number" name="renda" value={formData.renda} onChange={handleFormChange} required /></label>
          {clienteSendoEditado && (
            <label>Renda Familiar Total: <input type="text" value={formData.renda_familiar_total || formData.renda} readOnly disabled /></label>
          )}
          <label>Sexo:
            <select name="sexo" value={formData.sexo} onChange={handleFormChange}>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
              <option value="O">Outro</option>
            </select>
          </label>
          <label>Estado Civil:
            <select name="estado_civil" value={formData.estado_civil} onChange={handleFormChange} required>
              <option value="">Selecione...</option>
              <option value="solteiro">Solteiro(a)</option>
              <option value="casado">Casado(a)</option>
              <option value="divorciado">Divorciado(a)</option>
              <option value="viuvo">Viúvo(a)</option>
              <option value="uniao_estavel">União Estável</option>
            </select>
          </label>
           {(formData.estado_civil === 'casado' || formData.estado_civil === 'uniao_estavel') && (
            <>
                <label>Data de Casamento/União: <input type="date" name="data_casamento" value={formData.data_casamento} onChange={handleFormChange} /></label>
                <label>Regime de Bens:
                    <select name="regime_bens" value={formData.regime_bens} onChange={handleFormChange} disabled={formData.estado_civil !== 'casado'}>
                    <option value="">Selecione...</option>
                    <option value="comunhao_parcial">Comunhão Parcial</option>
                    <option value="comunhao_universal">Comunhão Universal</option>
                    <option value="separacao_total">Separação Total</option>
                    </select>
                </label>
            </>
           )}
        </div>

        <h3 className="form-section-title">Endereço</h3>
        <div className="form-grid">
            <label>CEP: <input type="text" name="endereco_attributes.cep" ref={cepRef} value={formData.endereco_attributes.cep} onChange={handleFormChange} /></label>
            <label className="grid-col-span-2">Logradouro: <input type="text" name="endereco_attributes.logradouro" value={formData.endereco_attributes.logradouro} onChange={handleFormChange} /></label>
            <label>Número: <input type="text" name="endereco_attributes.numero" value={formData.endereco_attributes.numero} onChange={handleFormChange} /></label>
            <label>Complemento: <input type="text" name="endereco_attributes.complemento" value={formData.endereco_attributes.complemento} onChange={handleFormChange} /></label>
            <label>Bairro: <input type="text" name="endereco_attributes.bairro" value={formData.endereco_attributes.bairro} onChange={handleFormChange} /></label>
            <label>Cidade: <input type="text" name="endereco_attributes.cidade" value={formData.endereco_attributes.cidade} onChange={handleFormChange} /></label>
            <label>Estado: <input type="text" name="endereco_attributes.estado" value={formData.endereco_attributes.estado} onChange={handleFormChange} /></label>
        </div>

        {mostrarConjuge && (
          <>
            <h3 className="form-section-title">Dados do Cônjuge</h3>
            <div className="form-grid">
                <label className="grid-col-span-2">Nome: <input type="text" name="conjuge_attributes.nome" value={formData.conjuge_attributes.nome} onChange={handleFormChange} /></label>
                <label>RG: <input type="text" name="conjuge_attributes.rg" value={formData.conjuge_attributes.rg} onChange={handleFormChange} /></label>
                <label>CPF: <input type="text" name="conjuge_attributes.cpf" ref={cpfConjugeRef} value={formData.conjuge_attributes.cpf} onChange={handleFormChange} /></label>
                <label>Email: <input type="email" name="conjuge_attributes.email" value={formData.conjuge_attributes.email} onChange={handleFormChange} /></label>
                <label>Celular: <input type="tel" name="conjuge_attributes.celular" value={formData.conjuge_attributes.celular} onChange={handleFormChange} /></label>
                <label>Data de Nascimento: <input type="date" name="conjuge_attributes.data_nascimento" value={formData.conjuge_attributes.data_nascimento} onChange={handleFormChange} /></label>
                <label>Nacionalidade: <input type="text" name="conjuge_attributes.nacionalidade" value={formData.conjuge_attributes.nacionalidade} onChange={handleFormChange} /></label>
                <label>Profissão: <input type="text" name="conjuge_attributes.profissao" value={formData.conjuge_attributes.profissao} onChange={handleFormChange} /></label>
                <label>Renda: <input type="number" name="conjuge_attributes.renda" value={formData.conjuge_attributes.renda} onChange={handleFormChange} /></label>
            </div>
          </>
        )}

        <div className="form-actions">
          <button type="submit" className="btn-salvar">{clienteSendoEditado ? 'Atualizar' : 'Salvar'}</button>
          <button type="button" onClick={onCancelEdit} className="btn-cancelar">Cancelar</button>
        </div>
      </form>
    </div>
  );
}

export default ClienteForm;
