require "test_helper"

class ClientesControllerTest < ActionDispatch::IntegrationTest
  setup do
    # Cria um usuário admin para autenticar
    @admin = Usuario.create!(nome: "Admin", email: "admin@example.com", login: "admin_test", senha: "password123", cpf: "00000000000", ativo: true, role: :admin)
    @cliente = Cliente.create!(nome: "Cliente Teste", email: "cliente@example.com", telefone: "81988887777", usuario: @admin)

    # Faz login na API para obter JWT
    post "/api/v1/login", params: { usuario: { login: @admin.login, password: "password123" } }, as: :json
    assert_response :success
    @token = JSON.parse(@response.body)["token"]
    @headers = { "Authorization" => "Bearer #{@token}", "Accept" => "application/json" }
  end

  test "atualiza estado_civil via string" do
    patch "/api/v1/clientes/#{@cliente.id}", params: { cliente: { estado_civil: "casado" } }, headers: @headers, as: :json
    assert_response :success

    get "/api/v1/clientes/#{@cliente.id}", headers: @headers
    assert_response :success
    body = JSON.parse(@response.body)
    assert_equal "casado", body["estado_civil"], "Deve persistir o enum como string na API"
  end

  test "atualiza estado_civil via inteiro" do
    patch "/api/v1/clientes/#{@cliente.id}", params: { cliente: { estado_civil: 1 } }, headers: @headers, as: :json
    assert_response :success

    get "/api/v1/clientes/#{@cliente.id}", headers: @headers
    assert_response :success
    body = JSON.parse(@response.body)
    assert_equal "casado", body["estado_civil"], "Deve aceitar inteiro e refletir como string na API"
  end
end
