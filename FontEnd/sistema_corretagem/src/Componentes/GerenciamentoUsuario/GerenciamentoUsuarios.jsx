import { useEffect, useState } from "react";
import "./GerenciamentoUsuarios.css";

function GerenciamentoUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [novoUsuario, setNovoUsuario] = useState({
    nome: "",
    email: "",
    login: "",
    password: "",
    cpf: "",
    ativo: true,
  });
  // Novo estado para rastrear o usuário que está sendo editado
  const [usuarioSendoEditado, setUsuarioSendoEditado] = useState(null);

  useEffect(() => {
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
      })
      .catch((error) => {
        console.error("Erro ao buscar usuários:", error);
        setCarregando(false);
      });
  }, []);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNovoUsuario((prevUsuario) => ({
      ...prevUsuario,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Lógica para saber se é uma criação (POST) ou atualização (PATCH)
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
        body: JSON.stringify(novoUsuario),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar usuário: " + response.statusText);
      }

      const usuarioAtualizado = await response.json();

      // Atualiza a lista de usuários no estado local
      if (usuarioSendoEditado) {
        setUsuarios(
          usuarios.map((u) =>
            u.id === usuarioSendoEditado.id ? usuarioAtualizado : u,
          ),
        );
        setUsuarioSendoEditado(null); // Sai do modo de edição
        alert("Usuário atualizado com sucesso!");
      } else {
        setUsuarios((prevUsuarios) => [...prevUsuarios, usuarioAtualizado]);
        alert("Usuário adicionado com sucesso!");
      }

      // Limpa os campos do formulário
      setNovoUsuario({
        nome: "",
        email: "",
        login: "",
        password: "",
        cpf: "",
        ativo: true,
      });
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
      alert("Erro ao salvar usuário. Verifique o console.");
    }
  };

  // Funções de edição e exclusão
  const handleEdit = (usuario) => {
    setUsuarioSendoEditado(usuario);
    setNovoUsuario(usuario); // Preenche o formulário com os dados do usuário
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja inativar este usuário?")) {
      try {
        const response = await fetch(`http://localhost:3000/usuarios/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          // Atualiza o estado local para marcar o usuário como inativo
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

  if (carregando) {
    return <h1>Carregando...</h1>;
  }

  return (
    <>
      <h1>Gerenciamento de Usuários</h1>
      <div className="formulario-container">
        {/* Muda o título do formulário com base no estado */}
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
            <div className="user-actions">
              <button onClick={() => handleEdit(usuario)}>Editar</button>
              {usuario.ativo && ( // O botão de excluir só aparece se o usuário estiver ativo
                <button onClick={() => handleDelete(usuario.id)}>
                  Inativar
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

export default GerenciamentoUsuarios;
