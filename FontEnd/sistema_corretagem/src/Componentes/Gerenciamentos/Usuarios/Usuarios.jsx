import { useEffect, useState } from "react";
import "./Usuarios.css";
import { FaEdit, FaUserSlash } from "react-icons/fa";

function Usuarios({ userRole }) {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const [novoUsuario, setNovoUsuario] = useState({
    nome: "",
    email: "",
    login: "",
    password: "",
    cpf: "",
    ativo: true,
    role: "corretor",
    // Adiciona o estado aninhado para o endereço
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
  const [usuarioSendoEditado, setUsuarioSendoEditado] = useState(null);

  useEffect(() => {
    // Adiciona um atraso de 300ms para exibir a mensagem
    const timer = setTimeout(() => {
      setShowLoading(true);
    }, 300);

    fetch("http://localhost:3000/usuarios")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erro na requisição: " + response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        setUsuarios(data);
        setCarregando(false);
        clearTimeout(timer);
      })
      .catch((error) => {
        console.error("Erro ao buscar usuários:", error);
        setCarregando(false);
        clearTimeout(timer);
      });

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Lógica para lidar com campos aninhados
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Se o campo for de endereço, atualiza o estado aninhado
    if (name.startsWith("endereco_attributes.")) {
      const field = name.split(".")[1];
      setNovoUsuario((prevUsuario) => ({
        ...prevUsuario,
        endereco_attributes: {
          ...prevUsuario.endereco_attributes,
          [field]: value,
        },
      }));
    } else {
      // Caso contrário, atualiza o estado de nível superior
      setNovoUsuario((prevUsuario) => ({
        ...prevUsuario,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const method = usuarioSendoEditado ? "PATCH" : "POST";
    const url = usuarioSendoEditado
      ? `http://localhost:3000/usuarios/${usuarioSendoEditado.id}`
      : "http://localhost:3000/usuarios";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        // Envia o estado completo de forma aninhada para o backend
        body: JSON.stringify({ usuario: novoUsuario }),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar usuário: " + response.statusText);
      }

      const usuarioAtualizado = await response.json();

      if (usuarioSendoEditado) {
        setUsuarios(
          usuarios.map((u) =>
            u.id === usuarioSendoEditado.id ? usuarioAtualizado : u,
          ),
        );
        setUsuarioSendoEditado(null);
        alert("Usuário atualizado com sucesso!");
      } else {
        setUsuarios((prevUsuarios) => [...prevUsuarios, usuarioAtualizado]);
        alert("Usuário adicionado com sucesso!");
      }

      setNovoUsuario({
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
      });
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
      alert("Erro ao salvar usuário. Verifique o console.");
    }
  };

  const handleEdit = (usuario) => {
    setUsuarioSendoEditado(usuario);
    // Preenche o formulário com os dados do usuário e do endereço
    setNovoUsuario({
      ...usuario,
      endereco_attributes: { ...usuario.endereco },
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja inativar este usuário?")) {
      try {
        const response = await fetch(`http://localhost:3000/usuarios/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setUsuarios(
            usuarios.map((u) => (u.id === id ? { ...u, ativo: false } : u)),
          );
          alert("Usuário inativado com sucesso!");
        } else {
          throw new Error("Erro ao inativar usuário.");
        }
      } catch (error) {
        console.error("Erro ao inativar usuário:", error);
        alert("Erro ao inativar usuário. Verifique o console.");
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
      <h1>Gerenciamento de Usuários</h1>
      <div className="formulario-container">
        <h2>
          {usuarioSendoEditado ? "Editar Usuário" : "Adicionar Novo Usuário"}
        </h2>
        <form onSubmit={handleFormSubmit}>
          <div className="form-group-row">
            <label>
              Nome:
              <input
                type="text"
                name="nome"
                value={novoUsuario.nome}
                onChange={handleFormChange}
                required
              />
            </label>
            <label>
              Email:
              <input
                type="email"
                name="email"
                value={novoUsuario.email}
                onChange={handleFormChange}
                required
              />
            </label>
          </div>
          <div className="form-group-row">
            <label>
              Login:
              <input
                type="text"
                name="login"
                value={novoUsuario.login}
                onChange={handleFormChange}
                required
              />
            </label>
            <label>
              Senha:
              <input
                type="password"
                name="password"
                value={novoUsuario.password}
                onChange={handleFormChange}
                required={!usuarioSendoEditado}
              />
            </label>
          </div>
          <div className="form-group-row">
            <label>
              CPF:
              <input
                type="text"
                name="cpf"
                value={novoUsuario.cpf}
                onChange={handleFormChange}
                required
              />
            </label>
            {userRole === "admin" && (
              <label>
                Papel:
                <select
                  name="role"
                  value={novoUsuario.role}
                  onChange={handleFormChange}
                >
                  <option value="corretor">Corretor</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            )}
          </div>
          <div className="form-group-row">
            <label>
              Ativo:
              <input
                type="checkbox"
                name="ativo"
                checked={novoUsuario.ativo}
                onChange={handleFormChange}
              />
            </label>
          </div>

          {/* Adicionando os campos de endereço */}
          <h3>Endereço</h3>
          <div className="form-group-address">
            <label>
              Logradouro:
              <input
                type="text"
                name="endereco_attributes.logradouro"
                value={novoUsuario.endereco_attributes.logradouro}
                onChange={handleFormChange}
              />
            </label>
            <label>
              Número:
              <input
                type="text"
                name="endereco_attributes.numero"
                value={novoUsuario.endereco_attributes.numero}
                onChange={handleFormChange}
              />
            </label>
            <label>
              Complemento:
              <input
                type="text"
                name="endereco_attributes.complemento"
                value={novoUsuario.endereco_attributes.complemento}
                onChange={handleFormChange}
              />
            </label>
            <label>
              Bairro:
              <input
                type="text"
                name="endereco_attributes.bairro"
                value={novoUsuario.endereco_attributes.bairro}
                onChange={handleFormChange}
              />
            </label>
            <label>
              Cidade:
              <input
                type="text"
                name="endereco_attributes.cidade"
                value={novoUsuario.endereco_attributes.cidade}
                onChange={handleFormChange}
              />
            </label>
            <label>
              Estado:
              <input
                type="text"
                name="endereco_attributes.estado"
                value={novoUsuario.endereco_attributes.estado}
                onChange={handleFormChange}
              />
            </label>
            <label>
              CEP:
              <input
                type="text"
                name="endereco_attributes.cep"
                value={novoUsuario.endereco_attributes.cep}
                onChange={handleFormChange}
              />
            </label>
          </div>
          <button type="submit">
            {usuarioSendoEditado ? "Salvar Alterações" : "Salvar Usuário"}
          </button>
          {usuarioSendoEditado && (
            <button type="button" onClick={() => setUsuarioSendoEditado(null)}>
              Cancelar
            </button>
          )}
        </form>
      </div>
      <hr />
      <h2>Lista de Usuários</h2>
      <ul className="lista-grid">
        {usuarios.map((usuario) => (
          <li
            key={usuario.id}
            className={`usuario-card ${!usuario.ativo ? "inativo" : ""}`}
          >
            <strong>{usuario.nome}</strong> - {usuario.email}
            <p>Status: {usuario.ativo ? "Ativo" : "Inativo"}</p>
            <p>Papel: {usuario.role}</p>
            <div className="user-actions">
              <button onClick={() => handleEdit(usuario)}>
                <FaEdit />
              </button>
              {usuario.ativo && (
                <button onClick={() => handleDelete(usuario.id)}>
                  <FaUserSlash />
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

export default Usuarios;
