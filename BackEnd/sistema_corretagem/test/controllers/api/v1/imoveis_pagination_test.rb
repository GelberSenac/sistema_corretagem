require "test_helper"

class Api::V1::ImoveisPaginationTest < ActionDispatch::IntegrationTest
  setup do
    # Cria usuário corretor e faz login para obter JWT (isola escopo e evita interferência de fixtures)
    @corretor = Usuario.create!(nome: "Corretor", email: "corretor@example.com", login: "corretor_pagination", password: "password123", ativo: true, role: :corretor)
    post "/api/v1/login", params: { usuario: { login: @corretor.login, password: "password123" } }, as: :json
    assert_response :success
    @token = JSON.parse(@response.body)["token"]
    @headers = { "Authorization" => "Bearer #{@token}", "Accept" => "application/json" }

    # Cria 25 imóveis para testar paginação (todos do corretor logado)
    25.times do |i|
      imovel = Imovel.create!(
        nome_empreendimento: "Empreendimento #{i}",
        tipo: :apartamento,
        finalidade: :venda,
        condicao: :usado,
        descricao: "Imóvel de teste #{i}",
        quartos: 2 + (i % 3),
        suites: 1,
        banheiros: 2,
        vagas_garagem: 1,
        metragem: 60 + i,
        ano_construcao: 2010,
        unidades_por_andar: 4,
        numero_torres: 1,
        andares: 10,
        elevadores: 1,
        varandas: 0,
        valor: 300000 + (i * 1000),
        valor_condominio: 500,
        valor_iptu: 1000,
        status: :disponivel,
        corretor: @corretor
      )
      imovel.create_endereco!(logradouro: "Rua #{i}", numero: "#{i}", complemento: "Apto #{i}", bairro: "Centro", cidade: "Recife", estado: "PE", cep: "5000000#{i % 10}")
    end

    @default_items = Pagy::DEFAULT[:items].to_i
    @total_count = 25
    @expected_total_pages = (@total_count.to_f / @default_items).ceil
  end

  test "headers de paginacao presentes em Imoveis#index" do
    get "/api/v1/imoveis", headers: @headers
    assert_response :success

    assert @response.headers["Total-Count"].present?, "Header Total-Count deve estar presente"
    assert @response.headers["Total-Pages"].present?, "Header Total-Pages deve estar presente"
    assert @response.headers["Current-Page"].present?, "Header Current-Page deve estar presente"
    assert @response.headers["Link"].present?, "Header Link deve estar presente"
    assert @response.headers["Page-Items"].present?, "Header Page-Items deve estar presente"

    body = JSON.parse(@response.body)
    assert_equal @default_items, body.size, "Deve retornar #{@default_items} itens na primeira página (config padrão)"
    assert_equal @total_count.to_s, @response.headers["Total-Count"], "Total-Count deve refletir total"
    assert_equal @expected_total_pages.to_s, @response.headers["Total-Pages"], "Total-Pages deve ser ceil(#{@total_count}/#{@default_items})"
    assert_equal "1", @response.headers["Current-Page"], "Current-Page deve ser 1"
    assert_equal @default_items.to_s, @response.headers["Page-Items"], "Page-Items deve refletir o padrão configurado"
  end

  test "overflow=:empty_page retorna corpo vazio e headers coerentes em Imoveis#index" do
    get "/api/v1/imoveis", params: { page: 999 }, headers: @headers
    assert_response :success

    body = JSON.parse(@response.body)
    assert body.is_a?(Array), "Resposta deve ser um array"
    assert_equal 0, body.size, "Página overflow deve retornar lista vazia"

    assert_equal "999", @response.headers["Current-Page"], "Current-Page deve refletir página solicitada"
    assert_equal @expected_total_pages.to_s, @response.headers["Total-Pages"], "Total-Pages deve refletir total de páginas reais"
    assert_equal @total_count.to_s, @response.headers["Total-Count"], "Total-Count deve refletir total"
    assert_equal @default_items.to_s, @response.headers["Page-Items"], "Page-Items deve refletir o padrão configurado"
  end

  test "escopo: corretor vê apenas seus imóveis em Imoveis#index" do
    # Cria imóveis de outro corretor
    outro_corretor = Usuario.create!(nome: "Outro Corretor", email: "outro_corretor_imoveis@example.com", login: "outro_corretor_i", password: "password123", ativo: true, role: :corretor)

    5.times do |i|
      imovel = Imovel.create!(
        nome_empreendimento: "OUTRO Empreendimento #{i}",
        tipo: :apartamento,
        finalidade: :venda,
        condicao: :usado,
        descricao: "Imóvel OUTRO #{i}",
        quartos: 2,
        suites: 1,
        banheiros: 2,
        vagas_garagem: 1,
        metragem: 70,
        ano_construcao: 2012,
        unidades_por_andar: 4,
        numero_torres: 1,
        andares: 10,
        elevadores: 1,
        varandas: 0,
        valor: 350000,
        valor_condominio: 500,
        valor_iptu: 1000,
        status: :disponivel,
        corretor: outro_corretor
      )
      imovel.create_endereco!(logradouro: "Rua OUTRO #{i}", numero: "#{i}", complemento: "Apto #{i}", bairro: "Centro", cidade: "Recife", estado: "PE", cep: "5000000#{i % 10}")
    end

    get "/api/v1/imoveis", headers: @headers
    assert_response :success

    # O corretor logado deve ver apenas seus 25 imóveis
    assert_equal @total_count.to_s, @response.headers["Total-Count"], "Corretor deve ver apenas seus imóveis"

    body = JSON.parse(@response.body)
    body.each do |imovel_json|
      # O nome dos imóveis do outro corretor possuem marca "OUTRO"
      refute_match(/OUTRO/, imovel_json["nome_empreendimento"].to_s)
    end
  end

  test "escopo: admin vê todos os imóveis em Imoveis#index" do
    # Cria imóveis de outro corretor
    outro_corretor = Usuario.create!(nome: "Outro Corretor", email: "outro_corretor_imoveis2@example.com", login: "outro_corretor_i2", password: "password123", ativo: true, role: :corretor)

    5.times do |i|
      imovel = Imovel.create!(
        nome_empreendimento: "OUTRO2 Empreendimento #{i}",
        tipo: :apartamento,
        finalidade: :venda,
        condicao: :usado,
        descricao: "Imóvel OUTRO2 #{i}",
        quartos: 2,
        suites: 1,
        banheiros: 2,
        vagas_garagem: 1,
        metragem: 70,
        ano_construcao: 2012,
        unidades_por_andar: 4,
        numero_torres: 1,
        andares: 10,
        elevadores: 1,
        varandas: 0,
        valor: 350000,
        valor_condominio: 500,
        valor_iptu: 1000,
        status: :disponivel,
        corretor: outro_corretor
      )
      imovel.create_endereco!(logradouro: "Rua OUTRO2 #{i}", numero: "#{i}", complemento: "Apto #{i}", bairro: "Centro", cidade: "Recife", estado: "PE", cep: "5000000#{i % 10}")
    end

    # Login como admin
    admin = Usuario.create!(nome: "Admin", email: "admin_imoveis@example.com", login: "admin_imoveis", password: "password123", ativo: true, role: :admin)
    post "/api/v1/login", params: { usuario: { login: admin.login, password: "password123" } }, as: :json
    assert_response :success
    token_admin = JSON.parse(@response.body)["token"]
    headers_admin = { "Authorization" => "Bearer #{token_admin}", "Accept" => "application/json" }

    get "/api/v1/imoveis", headers: headers_admin
    assert_response :success

    total_admin = Imovel.count.to_s
    assert_equal total_admin, @response.headers["Total-Count"], "Admin deve ver todos os imóveis"
  end

  test "parametro items altera tamanho da página em Imoveis#index" do
    items = 5
    get "/api/v1/imoveis", params: { items: items }, headers: @headers
    assert_response :success

    body = JSON.parse(@response.body)
    assert_equal items, body.size, "Deve retornar #{items} itens na primeira página quando items=#{items}"

    assert_equal items.to_s, @response.headers["Page-Items"], "Page-Items deve refletir o parâmetro items"
    expected_pages = (@total_count.to_f / items).ceil.to_s
    assert_equal expected_pages, @response.headers["Total-Pages"], "Total-Pages deve ser ceil(total/items) com items=#{items}"
  end
end