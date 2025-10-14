require "test_helper"

class UsuariosControllerTest < ActionDispatch::IntegrationTest
  test "GET /api/v1/usuarios sem autenticação retorna 401" do
    get "/api/v1/usuarios"
    assert_response :unauthorized
  end
end
