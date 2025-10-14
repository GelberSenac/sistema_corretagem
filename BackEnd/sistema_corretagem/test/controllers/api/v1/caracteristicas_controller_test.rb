require "test_helper"

class Api::V1::CaracteristicasControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = usuarios(:one)
    # Faz login via endpoint para obter token
    post "/api/v1/login", params: { usuario: { login: @user.login, password: "secret123" } }, as: :json
    assert_response :success
    @token = JSON.parse(@response.body)["token"]
    assert @token.present?, "Token JWT deve estar presente"
  end

  test "lista caracteristicas com id, nome e categoria" do
    get "/api/v1/caracteristicas", headers: { Authorization: "Bearer #{@token}" }
    assert_response :success

    body = JSON.parse(@response.body)
    assert body.is_a?(Array), "Resposta deve ser um array"
    assert body.first.key?("id"), "Primeiro item deve conter 'id'"
    assert body.first.key?("nome"), "Primeiro item deve conter 'nome'"
    assert body.first.key?("categoria"), "Primeiro item deve conter 'categoria'"

    # Validar que categorias são strings do enum
    categorias_validas = %w[comodos infraestrutura piso posicao proximidades]
    body.each do |item|
      assert_includes categorias_validas + [nil], item["categoria"], "Categoria deve ser válida ou nula"
    end
  end
end