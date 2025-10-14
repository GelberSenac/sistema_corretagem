import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from "react";
import { useMask } from "@react-input/mask";
import { toast } from "react-hot-toast";
import CurrencyInput, {
  formatCurrencyBR,
  parseCurrencyToNumber,
} from "../../Shared/CurrencyInput";
import AddressForm from "../../Shared/AddressForm";
import { Link } from "react-router-dom";
import PerfilBuscaForm from "../PerfisBusca/PerfilBuscaForm";
import { getPerfisBusca, createPerfilBusca, updatePerfilBusca, deletePerfilBusca } from "../../../Servicos/Api";

// Helpers para normalização de estado civil e verificação de exigência de cônjuge
const ESTADO_CIVIL_MAP = {
  casado: "casado",
  casados: "casado",
  "casado(a)": "casado",
  casamento: "casado",
  solteiro: "solteiro",
  "solteiro(a)": "solteiro",
  divorciado: "divorciado",
  "divorciado(a)": "divorciado",
  viuvo: "viuvo",
  "viúvo": "viuvo",
  "viúvo(a)": "viuvo",
  "uniao_estavel": "uniao_estavel",
  "uniao estavel": "uniao_estavel",
  "uniao": "uniao_estavel",
  "união estável": "uniao_estavel",
};
function normalizeText(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
function normalizaEstadoCivil(value) {
  const norm = normalizeText(value);
  return ESTADO_CIVIL_MAP[norm] || norm;
}
function exigeConjugeFromEstadoCivil(value) {
  const civ = normalizaEstadoCivil(value);
  return civ === "casado" || civ === "uniao_estavel";
}
// Normalizador robusto para datas em inputs type="date" (YYYY-MM-DD)
function toISODate(value) {
  if (!value) return "";
  const s = String(value).trim();
  // Se vier com timezone, remover a parte após o "T"
  const base = s.includes("T") ? s.split("T")[0] : s;
  if (/^\d{4}-\d{2}-\d{2}$/.test(base)) return base;
  const digits = base.replace(/\D/g, "");
  if (digits.length >= 8) {
    const last8 = digits.slice(-8);
    const y = last8.slice(0, 4);
    const m = last8.slice(4, 6);
    const d = last8.slice(6, 8);
    return `${y}-${m}-${d}`;
  }
  return "";
}

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
  renda_familiar_total: "",
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

function ClienteForm({ clienteSendoEditado, onFormSubmit, onCancelEdit, resetSignal }) {
  const [formData, setFormData] = useState(initialState);
  const [mostrarConjuge, setMostrarConjuge] = useState(false);
  // Estados para rastrear alterações e submissão
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Perfil de Busca (1:1 por cliente)
  const [perfilBuscaEmEdicao, setPerfilBuscaEmEdicao] = useState(null);
  const [perfilBuscaLoading, setPerfilBuscaLoading] = useState(false);
  // Draft e sujidade do Perfil de Busca embutido
  const [perfilBuscaDraft, setPerfilBuscaDraft] = useState(null);
  const [isPerfilBuscaDirty, setIsPerfilBuscaDirty] = useState(false);
  const perfilBuscaInitializedRef = useRef(false);
  const [perfilBuscaBloquear, setPerfilBuscaBloquear] = useState(false);

  const cpfClienteRef = useMask({
    mask: "___.___.___-__",
    replacement: { _: /\d/ },
  });
  // CEP mask centralizada no AddressForm; referência local removida
  const cpfConjugeRef = useMask({
    mask: "___.___.___-__",
    replacement: { _: /\d/ },
  });
  const telefoneRef = useMask({
    mask: "(__) _____-____",
    replacement: { _: /\d/ },
  });
  const rgClienteRef = useMask({
    mask: "_________-_",
    replacement: { _: /\d/ },
  });
  const rgConjugeRef = useMask({
    mask: "_________-_",
    replacement: { _: /\d/ },
  });
  // removido artefato de diff duplicado
  // (linha removida) const rgClienteRef = useMask({ mask: "_________-_", replacement: { _: /\d/ } });
  // (linha removida) const rgConjugeRef = useMask({ mask: "_________-_", replacement: { _: /\d/ } });

  useLayoutEffect(() => {
    if (clienteSendoEditado) {
      // log removido: clienteSendoEditado recebido
      const temConjuge = !!clienteSendoEditado.conjuge;
      const civilRaw = clienteSendoEditado.estado_civil;
      const civilNorm = normalizaEstadoCivil(civilRaw);
      // log removido: estado_civil normalizado
      setMostrarConjuge(temConjuge);
      const mapped = {
        ...initialState,
        ...clienteSendoEditado,
        estado_civil: civilNorm,
        data_nascimento: toISODate(clienteSendoEditado.data_nascimento),
        data_casamento: toISODate(clienteSendoEditado.data_casamento),
        endereco_attributes: clienteSendoEditado.endereco
          ? { ...clienteSendoEditado.endereco }
          : initialState.endereco_attributes,
        conjuge_attributes: clienteSendoEditado.conjuge
          ? (() => {
              const c = clienteSendoEditado.conjuge || {};
              const coerce = (v) => (v === null || v === undefined ? "" : v);
              return {
                ...initialState.conjuge_attributes,
                id: c.id,
                nome: coerce(c.nome),
                data_nascimento: toISODate(c.data_nascimento),
                cpf: coerce(c.cpf),
                rg: coerce(c.rg),
                profissao: coerce(c.profissao),
                renda: c.renda ?? "",
                email: coerce(c.email),
                celular: coerce(c.celular),
                nacionalidade: coerce(c.nacionalidade),
                data_casamento: toISODate(c.data_casamento),
                regime_bens: coerce(c.regime_bens),
              };
            })()
          : initialState.conjuge_attributes,
      };
      // log removido: mapeado para formData
      setFormData(mapped);
    } else {
      setFormData(initialState);
      setMostrarConjuge(false);
      setPerfilBuscaEmEdicao(null);
      setPerfilBuscaDraft(null);
      setIsPerfilBuscaDirty(false);
      perfilBuscaInitializedRef.current = false;
    }
  }, [clienteSendoEditado]);

  // Removido efeito que limpava conjuge_attributes, data_casamento e regime_bens quando estado_civil não exige.
// Manter os dados carregados e apenas desabilitar os campos via UI, a exclusão será tratada no submit (_destroy) quando necessário.

  // Removido efeito de limpeza de conjuge_attributes para manter dados visíveis mesmo quando desabilitados

  // Resetar formulário quando o pai sinalizar (criação contínua)
  const didMountRef = useRef(false);
  useEffect(() => {
    // Evita resetar no primeiro render (quando abrimos para editar)
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    if (resetSignal > 0) {
      // log removido: resetSignal recebido
      setFormData(initialState);
      setMostrarConjuge(false);
      setIsDirty(false);
      setPerfilBuscaDraft(null);
      setIsPerfilBuscaDirty(false);
      perfilBuscaInitializedRef.current = false;
      setPerfilBuscaBloquear(false);
    }
  }, [resetSignal]);

  useEffect(() => {
    const rendaCliente = parseFloat(formData.renda) || 0;
    const rendaConjuge = parseFloat(formData.conjuge_attributes.renda) || 0;
    const total = rendaCliente + rendaConjuge;
    setFormData((prev) => ({
      ...prev,
      renda_familiar_total: total.toFixed(2),
    }));
  }, [formData.renda, formData.conjuge_attributes.renda]);

  // Carregar Perfil de Busca existente quando editando um cliente
  useEffect(() => {
    const fetchPerfil = async () => {
      if (!clienteSendoEditado?.id) return;
      setPerfilBuscaLoading(true);
      try {
        const res = await getPerfisBusca(clienteSendoEditado.id);
        const payload = res?.data;
        const perfis = Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : []);
        const firstPerfil = perfis && perfis.length > 0 ? perfis[0] : null;
        setPerfilBuscaEmEdicao(firstPerfil);
        setPerfilBuscaDraft(firstPerfil);
        setIsPerfilBuscaDirty(false);
        perfilBuscaInitializedRef.current = false;
      } catch (err) {
        console.error("[ClienteForm] Erro ao carregar Perfil de Busca:", err);
      } finally {
        setPerfilBuscaLoading(false);
      }
    };
    fetchPerfil();
  }, [clienteSendoEditado?.id]);

  // ViaCEP centralizado no AddressForm; efeito local removido

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    const keys = name.split(".");
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
      setFormData((prev) => ({ ...prev, [name]: transformedValue }));
    }
    setIsDirty(true);
  };

  // Normaliza dados do perfil para comparação e envio
  const normalizePerfilBusca = (data) => {
    if (!data) return null;
    const bairrosArray = Array.isArray(data.bairros)
      ? data.bairros
      : Array.isArray(data.bairro_preferencia)
        ? data.bairro_preferencia
        : typeof data.bairro_preferencia === "string"
          ? data.bairro_preferencia.split(",").map((b) => b.trim()).filter(Boolean)
          : [];
    return {
      titulo_busca: data.titulo_busca || "",
      finalidade: data.finalidade || "venda",
      condicao: data.condicao || "",
      valor_maximo_imovel: data.valor_maximo_imovel ?? "",
      quartos_minimo: Number(data.quartos_minimo || 0),
      suites_minimo: Number(data.suites_minimo || 0),
      vagas_minimo: Number(data.vagas_minimo || 0),
      metragem_minima: Number(data.metragem_minima || 0),
      exige_varanda: !!data.exige_varanda,
      bairro_preferencia: bairrosArray,
      id: data.id,
    };
  };

  const onPerfilBuscaDataChange = useCallback((nextState) => {
    setPerfilBuscaDraft(nextState);
    const original = normalizePerfilBusca(perfilBuscaEmEdicao || {});
    const current = normalizePerfilBusca(nextState || {});
    // Na primeira inicialização, marcar como não sujo
    if (!perfilBuscaInitializedRef.current) {
      perfilBuscaInitializedRef.current = true;
      setIsPerfilBuscaDirty(false);
    } else {
      setIsPerfilBuscaDirty(JSON.stringify(original) !== JSON.stringify(current));
    }
  }, [perfilBuscaEmEdicao]);

  // Fecha com confirmação se houver alterações não salvas
  const handleClose = () => {
    if ((isDirty || isPerfilBuscaDirty) && !isSubmitting) {
      const confirmed = window.confirm(
        "Existem alterações não salvas. Deseja realmente fechar?",
      );
      if (!confirmed) return;
    }
    onCancelEdit?.();
    setIsDirty(false);
    setIsPerfilBuscaDirty(false);
    perfilBuscaInitializedRef.current = false;
  };

  const handleSubmit = async (e, options = {}) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    let finalFormData = { ...formData };

    // Remover chaves não permitidas pelo backend
    delete finalFormData.id;
    delete finalFormData.corretor;
    delete finalFormData.endereco;
    delete finalFormData.conjuge;
    delete finalFormData.renda_familiar_total;

    // Não enviar cônjuge se estado_civil não exigir; validar nome quando exigir
    const exigeConjuge =
      formData.estado_civil === "casado" ||
      formData.estado_civil === "uniao_estavel";
    if (!exigeConjuge) {
      const idConjuge =
        finalFormData.conjuge_attributes?.id ||
        clienteSendoEditado?.conjuge?.id;
      if (idConjuge) {
        finalFormData.conjuge_attributes = { id: idConjuge, _destroy: true };
      } else {
        delete finalFormData.conjuge_attributes;
      }
    } else {
      const nomeConjuge = (finalFormData.conjuge_attributes?.nome || "").trim();
      if (!nomeConjuge) {
        toast.error("Informe o nome do cônjuge.");
        setIsSubmitting(false);
        return;
      }
      // Sanitização básica de campos do cônjuge
      if (finalFormData.conjuge_attributes?.email) {
        finalFormData.conjuge_attributes.email =
          finalFormData.conjuge_attributes.email.trim();
      }
      if (finalFormData.conjuge_attributes?.celular) {
        finalFormData.conjuge_attributes.celular =
          finalFormData.conjuge_attributes.celular.trim();
      }
    }

    // Endereço: remoção via _destroy se existente e usuário apagar; bloquear parcialmente preenchido
    if (finalFormData.endereco_attributes) {
      const {
        id,
        logradouro = "",
        numero = "",
        complemento = "",
        bairro = "",
        cidade = "",
        estado = "",
        cep = "",
      } = finalFormData.endereco_attributes;
      const trimmed = {
        logradouro: (logradouro || "").trim(),
        numero: (numero || "").trim(),
        complemento: (complemento || "").trim(),
        bairro: (bairro || "").trim(),
        cidade: (cidade || "").trim(),
        estado: (estado || "").trim(),
        cep: (cep || "").trim(),
      };
      const allEmpty = Object.values(trimmed).every((v) => v.length === 0);
      const requiredFilled = [
        "logradouro",
        "numero",
        "bairro",
        "cidade",
        "estado",
        "cep",
      ].every((k) => trimmed[k].length > 0);
      const anyFilled = Object.values(trimmed).some((v) => v.length > 0);
      if (id && allEmpty) {
        finalFormData.endereco_attributes = { id, _destroy: true };
      } else if (!id && allEmpty) {
        delete finalFormData.endereco_attributes;
      } else if (anyFilled && !requiredFilled) {
        toast.error(
          "Preencha o endereço completo: CEP, Logradouro, Número, Bairro, Cidade e Estado.",
        );
        setIsSubmitting(false);
        return;
      } else {
        finalFormData.endereco_attributes = { ...trimmed, id };
      }
    }

    // Normalizações
    if (finalFormData.nome) finalFormData.nome = finalFormData.nome.trim();
    if (finalFormData.email) finalFormData.email = finalFormData.email.trim();
    if (finalFormData.telefone)
      finalFormData.telefone = finalFormData.telefone.trim();

    if (finalFormData.cpf)
      finalFormData.cpf = finalFormData.cpf.replace(/\D/g, "");
    if (finalFormData.endereco_attributes?.cep)
      finalFormData.endereco_attributes.cep =
        finalFormData.endereco_attributes.cep.replace(/\D/g, "");
    if (finalFormData.conjuge_attributes?.cpf) {
      finalFormData.conjuge_attributes.cpf =
        finalFormData.conjuge_attributes.cpf.replace(/\D/g, "");
    }

    try {
      await onFormSubmit(finalFormData, clienteSendoEditado?.id, options);
      // Após atualizar o cliente, processar o Perfil de Busca em modo unificado
      if (clienteSendoEditado?.id) {
        try {
          if (perfilBuscaBloquear && perfilBuscaEmEdicao?.id) {
            await deletePerfilBusca(clienteSendoEditado.id, perfilBuscaEmEdicao.id);
            toast.success("Perfil de busca bloqueado.");
            setPerfilBuscaEmEdicao(null);
            setPerfilBuscaDraft(null);
            setIsPerfilBuscaDirty(false);
            perfilBuscaInitializedRef.current = false;
            setPerfilBuscaBloquear(false);
          } else if (isPerfilBuscaDirty && perfilBuscaDraft) {
            const normalized = normalizePerfilBusca(perfilBuscaDraft || {});
            const payload = { ...normalized };
            delete payload.bairros; // Usamos bairro_preferencia no backend
            if (perfilBuscaEmEdicao?.id) {
              await updatePerfilBusca(clienteSendoEditado.id, perfilBuscaEmEdicao.id, payload);
            } else {
              await createPerfilBusca(clienteSendoEditado.id, payload);
            }
            toast.success("Perfil de busca salvo.");
            // Recarregar perfis para refletir estado atual
            try {
              const res = await getPerfisBusca(clienteSendoEditado.id);
              const payloadRes = res?.data;
              const perfis = Array.isArray(payloadRes?.data) ? payloadRes.data : (Array.isArray(payloadRes) ? payloadRes : []);
              const firstPerfil = perfis && perfis.length > 0 ? perfis[0] : null;
              setPerfilBuscaEmEdicao(firstPerfil);
              setPerfilBuscaDraft(firstPerfil);
              setIsPerfilBuscaDirty(false);
              perfilBuscaInitializedRef.current = false;
            } catch (e) { /* noop */ }
          }
        } catch (errPerfil) {
          console.error("[ClienteForm] Erro ao processar Perfil de Busca:", errPerfil);
          toast.error("Erro ao processar Perfil de Busca.");
        }
      }
      // Se não for criação contínua, podemos limpar o estado de sujidade aqui
      setIsDirty(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePerfilBuscaFormSubmit = async (perfilData, id) => {
    if (!clienteSendoEditado?.id) {
      toast.error("Salve o cliente antes de cadastrar o Perfil de Busca.");
      return;
    }
    // Mapeia 'bairros' -> 'bairro_preferencia' para o backend
    const normalized = normalizePerfilBusca(perfilData || {});
    const payload = {
      ...normalized,
    };
    // Remove chave auxiliar 'bairros' se existir
    delete payload.bairros;

    try {
      if (id) {
        await updatePerfilBusca(clienteSendoEditado.id, id, payload);
      } else if (perfilBuscaEmEdicao?.id) {
        // 1:1 — se já existe, atualiza em vez de criar
        await updatePerfilBusca(clienteSendoEditado.id, perfilBuscaEmEdicao.id, payload);
      } else {
        await createPerfilBusca(clienteSendoEditado.id, payload);
      }
      toast.success("Perfil de busca salvo!");
      // Recarrega o perfil atual e fecha a tela conforme solicitado
      try {
        const res = await getPerfisBusca(clienteSendoEditado.id);
        const payloadRes = res?.data;
        const perfis = Array.isArray(payloadRes?.data) ? payloadRes.data : (Array.isArray(payloadRes) ? payloadRes : []);
        const firstPerfil = perfis && perfis.length > 0 ? perfis[0] : null;
        setPerfilBuscaEmEdicao(firstPerfil);
        setPerfilBuscaDraft(firstPerfil);
        setIsPerfilBuscaDirty(false);
        perfilBuscaInitializedRef.current = false;
      } catch (e) { /* noop */ }
      handleClose();
    } catch (err) {
      console.error("[ClienteForm] Erro ao salvar Perfil de Busca:", err);
      toast.error("Ocorreu um erro ao salvar o Perfil de Busca.");
    }
  };

  return (
    <div className="formulario-container">
      <h2>
        {clienteSendoEditado ? "Editar Cliente" : "Adicionar Novo Cliente"}
      </h2>
      {clienteSendoEditado && (
        <div className="form-cta-row">
          {/* CTA removido para evitar duplicidade: gestão inline do Perfil de Busca */}
        </div>
      )}
      <form onSubmit={(e) => handleSubmit(e)}>
        <h3 className="form-section-title">Dados Pessoais</h3>
        <div className="form-grid">
          <label className="grid-col-span-2" htmlFor="nome">
            Nome:{" "}
            <input
              id="nome"
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleFormChange}
              required
            />
          </label>
          <label htmlFor="rg">
            RG:{" "}
            <input
              id="rg"
              type="text"
              name="rg"
              ref={rgClienteRef}
              value={formData.rg}
              onChange={handleFormChange}
            />
          </label>
          <label htmlFor="cpf">
            CPF:{" "}
            <input
              id="cpf"
              type="text"
              name="cpf"
              ref={cpfClienteRef}
              value={formData.cpf}
              onChange={handleFormChange}
              required
            />
          </label>

          <label className="grid-col-span-2" htmlFor="email">
            Email:{" "}
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleFormChange}
              required
            />
          </label>
          <label htmlFor="telefone">
            Telefone:{" "}
            <input
              id="telefone"
              type="tel"
              name="telefone"
              ref={telefoneRef}
              value={formData.telefone}
              onChange={handleFormChange}
              required
            />
          </label>
          <label htmlFor="data_nascimento">
            Data de Nascimento:{" "}
            <input
              id="data_nascimento"
              type="date"
              name="data_nascimento"
              value={formData.data_nascimento}
              onChange={handleFormChange}
              required
            />
          </label>

          <label htmlFor="sexo">
            Sexo:
            <select
              id="sexo"
              name="sexo"
              value={formData.sexo}
              onChange={handleFormChange}
            >
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
              <option value="O">Outro</option>
            </select>
          </label>
          <label htmlFor="nacionalidade">
            Nacionalidade:{" "}
            <input
              id="nacionalidade"
              type="text"
              name="nacionalidade"
              value={formData.nacionalidade}
              onChange={handleFormChange}
            />
          </label>
          <label htmlFor="profissao">
            Profissão:{" "}
            <input
              id="profissao"
              type="text"
              name="profissao"
              value={formData.profissao}
              onChange={handleFormChange}
              required
            />
          </label>
          <label htmlFor="renda">
            Renda:
            <CurrencyInput
              id="renda"
              name="renda"
              value={formData.renda}
              onChange={(num) =>
                setFormData((prev) => ({ ...prev, renda: num }))
              }
              required
            />
          </label>

          <label className="grid-col-span-2" htmlFor="estado_civil">
            Estado Civil:
            <select
              id="estado_civil"
              name="estado_civil"
              value={formData.estado_civil}
              onChange={handleFormChange}
              required
            >
              <option value="">Selecione...</option>
              <option value="solteiro">Solteiro(a)</option>
              <option value="casado">Casado(a)</option>
              <option value="divorciado">Divorciado(a)</option>
              <option value="viuvo">Viúvo(a)</option>
              <option value="uniao_estavel">União Estável</option>
            </select>
          </label>
          <label className="grid-col-span-2" htmlFor="renda_familiar_total">
            Renda Familiar Total:
            <CurrencyInput
              id="renda_familiar_total"
              value={
                formData.renda_familiar_total ??
                Number(formData.renda || 0) +
                  Number(formData.conjuge_attributes?.renda || 0)
              }
              readOnly
            />
          </label>

          {(exigeConjugeFromEstadoCivil(formData.estado_civil)) && (
            <>
              <label htmlFor="data_casamento">
                Data de Casamento/União:{" "}
                <input
                  id="data_casamento"
                  type="date"
                  name="data_casamento"
                  value={formData.data_casamento}
                  onChange={handleFormChange}
                />
              </label>
              <label htmlFor="regime_bens">
                Regime de Bens:
                <select
                  id="regime_bens"
                  name="regime_bens"
                  value={formData.regime_bens}
                  onChange={handleFormChange}
                  disabled={normalizaEstadoCivil(formData.estado_civil) !== "casado"}
                >
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
        <AddressForm
          address={formData.endereco_attributes}
          onFieldChange={(e) => handleFormChange(e)}
          gridClass="form-grid"
        />

        <h3 className="form-section-title">Dados do Cônjuge</h3>
        <div className="form-grid">
          <label className="grid-col-span-2" htmlFor="conjuge_nome">
            Nome: 
            <input
              id="conjuge_nome"
              type="text"
              name="conjuge_attributes.nome"
              value={formData.conjuge_attributes.nome}
              onChange={handleFormChange}
              disabled={normalizaEstadoCivil(formData.estado_civil) !== "casado" && normalizaEstadoCivil(formData.estado_civil) !== "uniao_estavel"}
            />
          </label>
          <label htmlFor="conjuge_rg">
            RG: 
            <input
              id="conjuge_rg"
              type="text"
              name="conjuge_attributes.rg"
              ref={rgConjugeRef}
              value={formData.conjuge_attributes.rg}
              onChange={handleFormChange}
              disabled={normalizaEstadoCivil(formData.estado_civil) !== "casado" && normalizaEstadoCivil(formData.estado_civil) !== "uniao_estavel"}
            />
          </label>
          <label htmlFor="conjuge_cpf">
            CPF: 
            <input
              id="conjuge_cpf"
              type="text"
              name="conjuge_attributes.cpf"
              ref={cpfConjugeRef}
              value={formData.conjuge_attributes.cpf}
              onChange={handleFormChange}
              disabled={normalizaEstadoCivil(formData.estado_civil) !== "casado" && normalizaEstadoCivil(formData.estado_civil) !== "uniao_estavel"}
            />
          </label>
          <label htmlFor="conjuge_email">
            Email: 
            <input
              id="conjuge_email"
              type="email"
              name="conjuge_attributes.email"
              value={formData.conjuge_attributes.email}
              onChange={handleFormChange}
              disabled={normalizaEstadoCivil(formData.estado_civil) !== "casado" && normalizaEstadoCivil(formData.estado_civil) !== "uniao_estavel"}
            />
          </label>
          <label htmlFor="conjuge_celular">
            Celular: 
            <input
              id="conjuge_celular"
              type="tel"
              name="conjuge_attributes.celular"
              value={formData.conjuge_attributes.celular}
              onChange={handleFormChange}
              disabled={normalizaEstadoCivil(formData.estado_civil) !== "casado" && normalizaEstadoCivil(formData.estado_civil) !== "uniao_estavel"}
            />
          </label>
          <label htmlFor="conjuge_data_nascimento">
            Data de Nascimento: 
            <input
              id="conjuge_data_nascimento"
              type="date"
              name="conjuge_attributes.data_nascimento"
              value={formData.conjuge_attributes.data_nascimento}
              onChange={handleFormChange}
              disabled={normalizaEstadoCivil(formData.estado_civil) !== "casado" && normalizaEstadoCivil(formData.estado_civil) !== "uniao_estavel"}
            />
          </label>
          <label htmlFor="conjuge_nacionalidade">
            Nacionalidade: 
            <input
              id="conjuge_nacionalidade"
              type="text"
              name="conjuge_attributes.nacionalidade"
              value={formData.conjuge_attributes.nacionalidade}
              onChange={handleFormChange}
              disabled={normalizaEstadoCivil(formData.estado_civil) !== "casado" && normalizaEstadoCivil(formData.estado_civil) !== "uniao_estavel"}
            />
          </label>
          <label htmlFor="conjuge_profissao">
            Profissão: 
            <input
              id="conjuge_profissao"
              type="text"
              name="conjuge_attributes.profissao"
              value={formData.conjuge_attributes.profissao}
              onChange={handleFormChange}
              disabled={normalizaEstadoCivil(formData.estado_civil) !== "casado" && normalizaEstadoCivil(formData.estado_civil) !== "uniao_estavel"}
            />
          </label>
          <label htmlFor="conjuge_renda">
            Renda:
            <CurrencyInput
              id="conjuge_renda"
              name="conjuge_attributes.renda"
              value={formData.conjuge_attributes.renda}
              onChange={(num) =>
                setFormData((prev) => ({
                  ...prev,
                  conjuge_attributes: {
                    ...prev.conjuge_attributes,
                    renda: num,
                  },
                }))
              }
              disabled={normalizaEstadoCivil(formData.estado_civil) !== "casado" && normalizaEstadoCivil(formData.estado_civil) !== "uniao_estavel"}
            />
          </label>
        </div>

        {clienteSendoEditado && (
          <>
            <h3 className="form-section-title">Perfil de Busca</h3>
            {/* Exibição inline do PerfilBuscaForm (1:1) */}
            <div style={{ marginTop: "10px" }}>
              <PerfilBuscaForm
                perfilSendoEditado={perfilBuscaEmEdicao}
                onFormSubmit={handlePerfilBuscaFormSubmit}
                onCancelEdit={() => setPerfilBuscaEmEdicao(null)}
                embedded={true}
                onFormDataChange={onPerfilBuscaDataChange}
              />
            </div>
            <div className="form-actions" style={{ marginTop: "10px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  checked={perfilBuscaBloquear}
                  onChange={(e) => setPerfilBuscaBloquear(e.target.checked)}
                />
                Bloquear perfil de busca
              </label>
            </div>
          </>
        )}

        <div className="form-actions">
          <button type="submit" className="btn-salvar">
            {clienteSendoEditado ? "Atualizar" : "Salvar"}
          </button>
          <button type="button" onClick={onCancelEdit} className="btn-cancelar">
            {clienteSendoEditado ? "Cancelar" : "Fechar"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ClienteForm;
