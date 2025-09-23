import { useEffect, useState } from "react";
import "./Clientes.css";
import { FaEdit, FaTrash } from "react-icons/fa";

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const [novoCliente, setNovoCliente] = useState({
    nome: "",
    rg: "",
    cpf: "",
    sexo: "",
    email: "",
    telefone: "",
    endereco_attributes: {
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
    },
  });
  const [clienteSendoEditado, setClienteSendoEditado] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(true);
    }, 300);

    fetch("http://localhost:3000/clientes")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erro na requisição: " + response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        setClientes(data);
        setCarregando(false);
        clearTimeout(timer);
      })
      .catch((error) => {
        console.error("Erro ao buscar clientes:", error);
        setCarregando(false);
        clearTimeout(timer);
      });

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("endereco_attributes.")) {
      const field = name.split(".")[1];
      setNovoCliente((prevCliente) => ({
        ...prevCliente,
        endereco_attributes: {
          ...prevCliente.endereco_attributes,
          [field]: value,
        },
      }));
    } else {
      setNovoCliente((prevCliente) => ({
        ...prevCliente,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const method = clienteSendoEditado ? "PATCH" : "POST";
    const url = clienteSendoEditado
      ? `http://localhost:3000/clientes/${clienteSendoEditado.id}`
      : "http://localhost:3000/clientes";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cliente: novoCliente }),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar cliente: " + response.statusText);
      }

      const clienteAtualizado = await response.json();

      if (clienteSendoEditado) {
        setClientes(
          clientes.map((c) =>
            c.id === clienteSendoEditado.id ? clienteAtualizado : c,
          ),
        );
        setClienteSendoEditado(null);
        alert("Cliente atualizado com sucesso!");
      } else {
        setClientes((prevClientes) => [...prevClientes, clienteAtualizado]);
        alert("Cliente adicionado com sucesso!");
      }

      setNovoCliente({
        nome: "",
        rg: "",
        cpf: "",
        sexo: "",
        email: "",
        telefone: "",
        endereco_attributes: {
          logradouro: "",
          numero: "",
          complemento: "",
          bairro: "",
          cidade: "",
          estado: "",
          cep: "",
        },
      });
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      alert("Erro ao salvar cliente. Verifique o console.");
    }
  };

  const handleEdit = (cliente) => {
    setClienteSendoEditado(cliente);
    setNovoCliente({
      ...cliente,
      endereco_attributes: cliente.endereco ? { ...cliente.endereco } : {},
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este cliente?")) {
      try {
        const response = await fetch(`http://localhost:3000/clientes/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setClientes(clientes.filter((c) => c.id !== id));
          alert("Cliente excluído com sucesso!");
        } else {
          throw new Error("Erro ao excluir cliente.");
        }
      } catch (error) {
        console.error("Erro ao excluir cliente:", error);
        alert("Erro ao excluir cliente. Verifique o console.");
      }
    }
  };

  if (carregando && showLoading) {
    return <h1 className="loading-message">Carregando dados...</h1>;
  }

  if (carregando) {
    return null;
  }

  return (
    <>
      <h1>Gerenciamento de Clientes</h1>
      <div className="formulario-container">
        <h2>
          {clienteSendoEditado ? "Editar Cliente" : "Adicionar Novo Cliente"}
        </h2>
        <form onSubmit={handleFormSubmit}>
          <div className="form-group-row">
            <label>
              Nome:
              <input
                type="text"
                name="nome"
                value={novoCliente.nome}
                onChange={handleFormChange}
                required
              />
            </label>
            <label>
              RG:
              <input
                type="text"
                name="rg"
                value={novoCliente.rg}
                onChange={handleFormChange}
                required
              />
            </label>
          </div>
          <div className="form-group-row">
            <label>
              CPF:
              <input
                type="text"
                name="cpf"
                value={novoCliente.cpf}
                onChange={handleFormChange}
                required
              />
            </label>
            <label>
              Sexo:
              <select
                name="sexo"
                value={novoCliente.sexo}
                onChange={handleFormChange}
                required
              >
                <option value="">Selecione</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
                <option value="O">Outro</option>
              </select>
            </label>
          </div>
          <div className="form-group-row">
            <label>
              Email:
              <input
                type="email"
                name="email"
                value={novoCliente.email}
                onChange={handleFormChange}
                required
              />
            </label>
            <label>
              Telefone:
              <input
                type="text"
                name="telefone"
                value={novoCliente.telefone}
                onChange={handleFormChange}
                required
              />
            </label>
          </div>

          <h3>Endereço</h3>
          <div className="form-group-address">
            <label>
              Logradouro:
              <input
                type="text"
                name="endereco_attributes.logradouro"
                value={novoCliente.endereco_attributes.logradouro}
                onChange={handleFormChange}
              />
            </label>
            <label>
              Número:
              <input
                type="text"
                name="endereco_attributes.numero"
                value={novoCliente.endereco_attributes.numero}
                onChange={handleFormChange}
              />
            </label>
            <label>
              Complemento:
              <input
                type="text"
                name="endereco_attributes.complemento"
                value={novoCliente.endereco_attributes.complemento}
                onChange={handleFormChange}
              />
            </label>
            <label>
              Bairro:
              <input
                type="text"
                name="endereco_attributes.bairro"
                value={novoCliente.endereco_attributes.bairro}
                onChange={handleFormChange}
              />
            </label>
            <label>
              Cidade:
              <input
                type="text"
                name="endereco_attributes.cidade"
                value={novoCliente.endereco_attributes.cidade}
                onChange={handleFormChange}
              />
            </label>
            <label>
              Estado:
              <input
                type="text"
                name="endereco_attributes.estado"
                value={novoCliente.endereco_attributes.estado}
                onChange={handleFormChange}
              />
            </label>
            <label>
              CEP:
              <input
                type="text"
                name="endereco_attributes.cep"
                value={novoCliente.endereco_attributes.cep}
                onChange={handleFormChange}
              />
            </label>
          </div>
          <button type="submit">
            {clienteSendoEditado ? "Salvar Alterações" : "Salvar Cliente"}
          </button>
          {clienteSendoEditado && (
            <button type="button" onClick={() => setClienteSendoEditado(null)}>
              Cancelar
            </button>
          )}
        </form>
      </div>
      <hr />
      <h2>Lista de Clientes</h2>
      <ul className="lista-grid">
        {clientes.map((cliente) => (
          <li key={cliente.id} className="cliente-card">
            <strong>{cliente.nome}</strong> - {cliente.email}
            <div className="user-actions">
              <button onClick={() => handleEdit(cliente)}>
                <FaEdit />
              </button>
              <button onClick={() => handleDelete(cliente.id)}>
                <FaTrash />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

export default Clientes;
