require "test_helper"

class ApiV1UsuariosRequestsTest < ActionDispatch::IntegrationTest
  def setup
    # Cria um usuário real com senha para autenticação via JWT
    @usuario = Usuario.create!(
      nome: "João Teste",
      email: "joao.teste@example.com",
      login: "joao_login",
      password: "secret123",

      ativo: true,
      role: :corretor
    )

    # Endereço associado (polimórfico) ao usuário
    @usuario.create_endereco!(
      logradouro: "Rua das Flores",
      numero: "123",
      complemento: "Apto 45",
      bairro: "Centro",
      cidade: "Recife",
      estado: "pe", # propositalmente minúsculo para validar normalização
      cep: "50000000"
    )

    # Perfil de corretor associado ao usuário
    @usuario.create_perfil_corretor!(
      creci: "99999",
      creci_estado: "pe" # propositalmente minúsculo para validar normalização
    )
  end

  # Helper para realizar login e obter o token JWT
  def login_and_get_token(login: @usuario.login, password: "secret123")
    post "/api/v1/login", params: { usuario: { login: login, password: password } }, as: :json
    assert_response :success, "Login deve retornar 200 OK"
    body = JSON.parse(@response.body)
    assert body["token"].present?, "Resposta de login deve conter token"
    body["token"]
  end

  test "login retorna JWT e dados do usuário" do
    token = login_and_get_token
    assert token.is_a?(String), "Token JWT deve ser uma string"
  end

  test "GET /api/v1/usuarios/:id inclui endereco serializado" do
    token = login_and_get_token
    get "/api/v1/usuarios/#{@usuario.id}", headers: { "Authorization" => "Bearer #{token}" }
    assert_response :success

    body = JSON.parse(@response.body)

    # Valida campos básicos do usuário
    assert_equal @usuario.id, body["id"], "Resposta deve incluir id do usuário"
    assert_equal @usuario.nome, body["nome"], "Resposta deve incluir nome do usuário"

    # Valida inclusão do perfil_corretor (já existente no serializer)
    assert body["perfil_corretor"].is_a?(Hash), "Resposta deve incluir perfil_corretor"
    assert_equal "PE", body.dig("perfil_corretor", "creci_estado"), "Enum de creci_estado deve estar normalizado em maiúsculas"

    # Valida inclusão do endereço (implementação solicitada)
    assert body["endereco"].is_a?(Hash), "Resposta deve incluir endereco"
    endereco = body["endereco"]
    assert_equal @usuario.endereco.id, endereco["id"], "Endereço deve ser do usuário solicitado"
    assert_equal "PE", endereco["estado"], "Enum de estado deve estar normalizado em maiúsculas"
    assert_equal "Recife", endereco["cidade"], "Cidade deve ser serializada corretamente"
    assert_equal "50000000", endereco["cep"], "CEP deve ser serializado corretamente"
  end

  test "PATCH /api/v1/usuarios/:id atualiza endereco e perfil_corretor com normalização" do
    token = login_and_get_token

    patch "/api/v1/usuarios/#{@usuario.id}",
      params: {
        usuario: {
          endereco_attributes: {
            id: @usuario.endereco.id,
            estado: "pe", # minúsculo para testar normalização
            cidade: "Olinda"
          },
          perfil_corretor_attributes: {
            id: @usuario.perfil_corretor.id,
            creci_estado: "pe" # minúsculo para testar normalização
          }
        }
      },
      headers: { "Authorization" => "Bearer #{token}" },
      as: :json

    assert_response :success
    body = JSON.parse(@response.body)

    # Confirma que o endereço foi atualizado e normalizado
    endereco = body["endereco"]
    assert_equal "PE", endereco["estado"], "Estado deve ser normalizado para maiúsculas"
    assert_equal "Olinda", endereco["cidade"], "Cidade deve ser atualizada"

    # Confirma que o perfil do corretor foi atualizado e normalizado
    perfil = body["perfil_corretor"]
    assert_equal "PE", perfil["creci_estado"], "creci_estado deve ser normalizado para maiúsculas"
  end
end