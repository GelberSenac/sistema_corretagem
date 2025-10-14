require "test_helper"

class Api::V1::AgendamentosPaginationTest < ActionDispatch::IntegrationTest
  setup do
    # Usuário corretor para isolar escopo
    @corretor = Usuario.create!(nome: "Corretor", email: "corretor_agenda@example.com", login: "corretor_agenda", password: "password123", ativo: true, role: :corretor)
    post "/api/v1/login", params: { usuario: { login: @corretor.login, password: "password123" } }, as: :json
    assert_response :success
    @token = JSON.parse(@response.body)["token"]
    @headers = { "Authorization" => "Bearer #{@token}", "Accept" => "application/json" }

    # Cria 25 agendamentos vinculados ao corretor, sem conflitos de horário
    25.times do |i|
      cliente = Cliente.create!(
        nome: "Cliente #{i}",
        email: "cliente#{i}@example.com",
        telefone: "8199999#{format('%03d', i)}",
        data_nascimento: Date.current - 25.years,
        estado_civil: :solteiro,
        profissao: "Profissao #{i}",
        renda: 3500 + i,
        corretor: @corretor
      )
      imovel = Imovel.create!(
        nome_empreendimento: "Agenda Empreendimento #{i}",
        tipo: :apartamento,
        finalidade: :venda,
        condicao: :usado,
        descricao: "Imóvel agenda #{i}",
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

      # Preenche atributos corretos do modelo Agendamento
      inicio = Time.current + i.days
      fim = inicio + 1.hour
      Agendamento.create!(
        usuario: @corretor,
        cliente: cliente,
        imovel: imovel,
        titulo: "Visita #{i}",
        descricao: "Agendamento #{i}",
        data_inicio: inicio,
        data_fim: fim,
        local: "Local #{i}",
        status: :agendado
      )
    end

    @default_items = Pagy::DEFAULT[:items].to_i
    @total_count = 25
    @expected_total_pages = (@total_count.to_f / @default_items).ceil
  end

  test "headers de paginacao presentes em Agendamentos#index" do
    get "/api/v1/agendamentos", headers: @headers
    assert_response :success

    assert @response.headers["Total-Count"].present?, "Header Total-Count deve estar presente"
    assert @response.headers["Total-Pages"].present?, "Header Total-Pages deve estar presente"
    assert @response.headers["Current-Page"].present?, "Header Current-Page deve estar presente"
    assert @response.headers["Link"].present?, "Header Link deve estar presente"
    assert @response.headers["Page-Items"].present?, "Header Page-Items deve estar presente"

    body = JSON.parse(@response.body)
    assert_equal @default_items, body.size, "Deve retornar #{@default_items} itens na primeira página"
    assert_equal @total_count.to_s, @response.headers["Total-Count"], "Total-Count deve refletir total escopado"
    assert_equal @expected_total_pages.to_s, @response.headers["Total-Pages"], "Total-Pages deve ser ceil(#{@total_count}/#{@default_items})"
    assert_equal "1", @response.headers["Current-Page"], "Current-Page deve ser 1"
    assert_equal @default_items.to_s, @response.headers["Page-Items"], "Page-Items deve refletir o padrão configurado"
  end

  test "overflow=:empty_page retorna corpo vazio e headers coerentes em Agendamentos#index" do
    get "/api/v1/agendamentos", params: { page: 999 }, headers: @headers
    assert_response :success

    body = JSON.parse(@response.body)
    assert body.is_a?(Array), "Resposta deve ser um array"
    assert_equal 0, body.size, "Página overflow deve retornar lista vazia"

    assert_equal "999", @response.headers["Current-Page"], "Current-Page deve refletir página solicitada"
    assert_equal @expected_total_pages.to_s, @response.headers["Total-Pages"], "Total-Pages deve refletir total de páginas reais"
    assert_equal @total_count.to_s, @response.headers["Total-Count"], "Total-Count deve refletir total escopado"
    assert_equal @default_items.to_s, @response.headers["Page-Items"], "Page-Items deve refletir o padrão configurado"
  end

  test "escopo: corretor vê apenas seus agendamentos em Agendamentos#index" do
    # Cria agendamentos de outro corretor
    outro_corretor = Usuario.create!(nome: "Outro Corretor", email: "outro_corretor_agenda@example.com", login: "outro_corretor_a", password: "password123", ativo: true, role: :corretor)
    5.times do |i|
      cliente = Cliente.create!(
        nome: "Cliente OUTRO #{i}",
        email: "cliente_outro#{i}@example.com",
        telefone: "8199888#{format('%03d', i)}",
        data_nascimento: Date.current - 25.years,
        estado_civil: :solteiro,
        profissao: "Profissao OUTRO #{i}",
        renda: 3500 + i,
        corretor: outro_corretor
      )
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
      imovel.create_endereco!(logradouro: "Rua OUTROAG #{i}", numero: "#{i}", complemento: "Apto #{i}", bairro: "Centro", cidade: "Recife", estado: "PE", cep: "5000000#{i % 10}")

      inicio = Time.current + i.days
      fim = inicio + 1.hour
      Agendamento.create!(
        usuario: outro_corretor,
        cliente: cliente,
        imovel: imovel,
        titulo: "Visita OUTRO #{i}",
        descricao: "Agendamento OUTRO #{i}",
        data_inicio: inicio,
        data_fim: fim,
        local: "Local OUTRO #{i}",
        status: :agendado
      )
    end

    get "/api/v1/agendamentos", headers: @headers
    assert_response :success

    # O corretor logado deve ver apenas seus 25 agendamentos
    assert_equal @total_count.to_s, @response.headers["Total-Count"], "Corretor deve ver apenas seus agendamentos"

    body = JSON.parse(@response.body)
    body.each do |agendamento_json|
      # O título dos agendamentos do outro corretor possuem marca "OUTRO"
      refute_match(/OUTRO/, agendamento_json["titulo"].to_s)
    end
  end

  test "escopo: admin vê todos os agendamentos em Agendamentos#index" do
    # Cria agendamentos de outro corretor
    outro_corretor = Usuario.create!(nome: "Outro Corretor", email: "outro_corretor_agenda2@example.com", login: "outro_corretor_a2", password: "password123", ativo: true, role: :corretor)
    5.times do |i|
      cliente = Cliente.create!(
        nome: "Cliente OUTRO2 #{i}",
        email: "cliente_outro2_#{i}@example.com",
        telefone: "8199777#{format('%03d', i)}",
        data_nascimento: Date.current - 25.years,
        estado_civil: :solteiro,
        profissao: "Profissao OUTRO2 #{i}",
        renda: 3500 + i,
        corretor: outro_corretor
      )
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
      imovel.create_endereco!(logradouro: "Rua OUTROAG2 #{i}", numero: "#{i}", complemento: "Apto #{i}", bairro: "Centro", cidade: "Recife", estado: "PE", cep: "5000000#{i % 10}")

      inicio = Time.current + i.days
      fim = inicio + 1.hour
      Agendamento.create!(
        usuario: outro_corretor,
        cliente: cliente,
        imovel: imovel,
        titulo: "Visita OUTRO2 #{i}",
        descricao: "Agendamento OUTRO2 #{i}",
        data_inicio: inicio,
        data_fim: fim,
        local: "Local OUTRO2 #{i}",
        status: :agendado
      )
    end

    # Login como admin
    admin = Usuario.create!(nome: "Admin", email: "admin_agenda@example.com", login: "admin_agenda", password: "password123", ativo: true, role: :admin)
    post "/api/v1/login", params: { usuario: { login: admin.login, password: "password123" } }, as: :json
    assert_response :success
    token_admin = JSON.parse(@response.body)["token"]
    headers_admin = { "Authorization" => "Bearer #{token_admin}", "Accept" => "application/json" }

    get "/api/v1/agendamentos", headers: headers_admin
    assert_response :success

    total_admin = Agendamento.count.to_s
    assert_equal total_admin, @response.headers["Total-Count"], "Admin deve ver todos os agendamentos"
  end

  test "parametro items altera tamanho da página em Agendamentos#index" do
    items = 5
    get "/api/v1/agendamentos", params: { items: items }, headers: @headers
    assert_response :success

    body = JSON.parse(@response.body)
    assert_equal items, body.size, "Deve retornar #{items} itens na primeira página quando items=#{items}"

    assert_equal items.to_s, @response.headers["Page-Items"], "Page-Items deve refletir o parâmetro items"
    expected_pages = (@total_count.to_f / items).ceil.to_s
    assert_equal expected_pages, @response.headers["Total-Pages"], "Total-Pages deve ser ceil(total/items) com items=#{items}"
  end
end