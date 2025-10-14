require "test_helper"

class Api::V1::ImoveisBuscarPaginationTest < ActionDispatch::IntegrationTest
  setup do
    # Usuário corretor para isolar escopo
    @corretor = Usuario.create!(nome: "Corretor", email: "corretor_busca@example.com", login: "corretor_busca", password: "password123", ativo: true, role: :corretor)
    post "/api/v1/login", params: { usuario: { login: @corretor.login, password: "password123" } }, as: :json
    assert_response :success
    @token = JSON.parse(@response.body)["token"]
    @headers = { "Authorization" => "Bearer #{@token}", "Accept" => "application/json" }

    # Cliente vinculado ao corretor (necessário para PerfilBusca)
    @cliente = Cliente.create!(
      nome: "Cliente Busca",
      email: "cliente_busca@example.com",
      telefone: "(81) 99999-0000",
      data_nascimento: Date.current - 30.years,
      estado_civil: :solteiro,
      profissao: "Analista",
      renda: 5000,
      corretor: @corretor
    )

    # PerfilBusca do cliente (compatível com modelo)
    @perfil_busca = PerfilBusca.create!(
      cliente: @cliente,
      titulo_busca: "Apartamento para compra",
      finalidade: :venda,
      condicao: :usado,
      bairro_preferencia: ["Centro"],
      valor_maximo_imovel: 500000,
      quartos_minimo: 2,
      metragem_minima: 50,
      exige_varanda: false
    )

    # Cria 25 imóveis que casam com o perfil
    25.times do |i|
      imovel = Imovel.create!(
        nome_empreendimento: "Busca Empreendimento #{i}",
        tipo: :apartamento,
        finalidade: :venda,
        condicao: :usado,
        descricao: "Imóvel busca #{i}",
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

  test "headers de paginacao presentes em Imoveis#buscar" do
    get "/api/v1/imoveis/buscar", params: { perfil_busca_id: @perfil_busca.id }, headers: @headers
    assert_response :success

    assert @response.headers["Total-Count"].present?, "Header Total-Count deve estar presente"
    assert @response.headers["Total-Pages"].present?, "Header Total-Pages deve estar presente"
    assert @response.headers["Current-Page"].present?, "Header Current-Page deve estar presente"
    assert @response.headers["Link"].present?, "Header Link deve estar presente"
    assert @response.headers["Page-Items"].present?, "Header Page-Items deve estar presente"

    body = JSON.parse(@response.body)
    assert_equal @default_items, body.size, "Deve retornar #{@default_items} itens na primeira página"
    assert_equal @total_count.to_s, @response.headers["Total-Count"], "Total-Count deve refletir total filtrado"
    assert_equal @expected_total_pages.to_s, @response.headers["Total-Pages"], "Total-Pages deve ser ceil(#{@total_count}/#{@default_items})"
    assert_equal "1", @response.headers["Current-Page"], "Current-Page deve ser 1"
    assert_equal @default_items.to_s, @response.headers["Page-Items"], "Page-Items deve refletir o padrão configurado"
  end

  test "overflow=:empty_page retorna corpo vazio e headers coerentes em Imoveis#buscar" do
    get "/api/v1/imoveis/buscar", params: { perfil_busca_id: @perfil_busca.id, page: 999 }, headers: @headers
    assert_response :success

    body = JSON.parse(@response.body)
    assert body.is_a?(Array), "Resposta deve ser um array"
    assert_equal 0, body.size, "Página overflow deve retornar lista vazia"

    assert_equal "999", @response.headers["Current-Page"], "Current-Page deve refletir página solicitada"
    assert_equal @expected_total_pages.to_s, @response.headers["Total-Pages"], "Total-Pages deve refletir total de páginas reais"
    assert_equal @total_count.to_s, @response.headers["Total-Count"], "Total-Count deve refletir total filtrado"
    assert_equal @default_items.to_s, @response.headers["Page-Items"], "Page-Items deve refletir o padrão configurado"
  end

  test "escopo: corretor vê apenas seus imóveis em Imoveis#buscar" do
    # Cria imóveis de outro corretor compatíveis com o perfil que não devem aparecer
    outro_corretor = Usuario.create!(nome: "Outro Corretor", email: "outro_corretor_busca@example.com", login: "outro_corretor_busca", password: "password123", ativo: true, role: :corretor)
    5.times do |i|
      imovel = Imovel.create!(
        nome_empreendimento: "OUTRO Empreendimento Busca #{i}",
        tipo: :apartamento,
        finalidade: :venda,
        condicao: :usado,
        descricao: "Imóvel outro busca #{i}",
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
      imovel.create_endereco!(logradouro: "Rua OUTROBUSCA #{i}", numero: "#{i}", complemento: "Apto #{i}", bairro: "Centro", cidade: "Recife", estado: "PE", cep: "5000000#{i % 10}")
    end

    get "/api/v1/imoveis/buscar", params: { perfil_busca_id: @perfil_busca.id }, headers: @headers
    assert_response :success

    # O corretor logado deve ver apenas seus 25 imóveis compatíveis
    assert_equal @total_count.to_s, @response.headers["Total-Count"], "Corretor deve ver apenas seus imóveis compatíveis"

    body = JSON.parse(@response.body)
    body.each do |imovel_json|
      refute_match(/OUTRO Empreendimento Busca/, imovel_json["nome_empreendimento"].to_s)
    end
  end

  test "escopo: admin vê todos os imóveis compatíveis em Imoveis#buscar" do
    outro_corretor = Usuario.create!(nome: "Outro Corretor", email: "outro_corretor_busca2@example.com", login: "outro_corretor_b2", password: "password123", ativo: true, role: :corretor)
    5.times do |i|
      imovel = Imovel.create!(
        nome_empreendimento: "OUTRO2 Empreendimento Busca #{i}",
        tipo: :apartamento,
        finalidade: :venda,
        condicao: :usado,
        descricao: "Imóvel outro2 busca #{i}",
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
      imovel.create_endereco!(logradouro: "Rua OUTROBUSCA2 #{i}", numero: "#{i}", complemento: "Apto #{i}", bairro: "Centro", cidade: "Recife", estado: "PE", cep: "5000000#{i % 10}")
    end

    # Login como admin
    admin = Usuario.create!(nome: "Admin", email: "admin_busca@example.com", login: "admin_busca", password: "password123", ativo: true, role: :admin)
    post "/api/v1/login", params: { usuario: { login: admin.login, password: "password123" } }, as: :json
    assert_response :success
    token_admin = JSON.parse(@response.body)["token"]
    headers_admin = { "Authorization" => "Bearer #{token_admin}", "Accept" => "application/json" }

    get "/api/v1/imoveis/buscar", params: { perfil_busca_id: @perfil_busca.id }, headers: headers_admin
    assert_response :success

    total_admin = (@total_count + 5).to_s
    assert_equal total_admin, @response.headers["Total-Count"], "Admin deve ver todos os imóveis compatíveis (do corretor e de outros)"
  end

  test "parametro items altera tamanho da página em Imoveis#buscar" do
    items = 5
    get "/api/v1/imoveis/buscar", params: { perfil_busca_id: @perfil_busca.id, items: items }, headers: @headers
    assert_response :success

    body = JSON.parse(@response.body)
    assert_equal items, body.size, "Deve retornar #{items} itens na primeira página quando items=#{items}"
    assert_equal items.to_s, @response.headers["Page-Items"], "Page-Items deve refletir o parâmetro items"

    expected_pages = (@total_count.to_f / items).ceil.to_s
    assert_equal expected_pages, @response.headers["Total-Pages"], "Total-Pages deve ser ceil(total/items) com items=#{items}"
  end
end