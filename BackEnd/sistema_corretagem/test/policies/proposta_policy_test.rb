require 'test_helper'

class PropostaPolicyTest < ActiveSupport::TestCase
  setup do

    @user1 = usuarios(:one)
    @user2 = usuarios(:two)

    # Criar imóveis válidos e isolados para cada usuário (evita dependência de fixtures que podem ter vínculos)
    @imovel1 = Imovel.create!(nome_empreendimento: "Edifício Teste 1", tipo: :apartamento, finalidade: :venda, condicao: :usado, descricao: "Imóvel teste 1", quartos: 2, banheiros: 1, vagas_garagem: 1, metragem: 50, valor: 300000.0, corretor: @user1)
    @imovel2 = Imovel.create!(nome_empreendimento: "Condomínio Teste 2", tipo: :casa, finalidade: :aluguel, condicao: :lancamento, descricao: "Imóvel teste 2", quartos: 3, banheiros: 2, vagas_garagem: 2, metragem: 100, valor: 5000.0, corretor: @user2)

    # Criar clientes válidos e isolados para cada usuário
    @cliente1 = Cliente.create!(nome: "Cliente Teste 1", telefone: "11999999999", email: "cliente.proposta1@example.com", corretor: @user1, data_nascimento: Date.new(1990, 1, 1), estado_civil: :solteiro, profissao: "Analista", renda: 10000)
    @cliente2 = Cliente.create!(nome: "Cliente Teste 2", telefone: "11988888888", email: "cliente.proposta2@example.com", corretor: @user2, data_nascimento: Date.new(1992, 2, 2), estado_civil: :casado, profissao: "Designer", renda: 8000)

    # Criar propostas válidas para testar autorizações
    @proposta1 = Proposta.create!(usuario: @user1, cliente: @cliente1, imovel: @imovel1, valor_proposta: 100000, data_proposta: Date.today, condicoes_pagamento: { forma: "avista" }, status: :em_analise)
    @proposta2 = Proposta.create!(usuario: @user2, cliente: @cliente2, imovel: @imovel2, valor_proposta: 200000, data_proposta: Date.today, condicoes_pagamento: { forma: "financiamento" }, status: :em_analise)
  end

  test "scope" do
    # Admin vê todas as propostas
    admin = Usuario.create!(nome: "Admin", email: "admin+proposta_policy@example.com", login: "admin_prop_pol", password: "secret123", role: :admin)
    scope_admin = PropostaPolicy::Scope.new(admin, Proposta).resolve
    assert_equal Proposta.order(:id).pluck(:id), scope_admin.order(:id).pluck(:id)

    # Corretor vê apenas suas propostas
    scope_user1 = PropostaPolicy::Scope.new(@user1, Proposta).resolve
    assert_equal @user1.propostas.order(:id).pluck(:id), scope_user1.order(:id).pluck(:id)
  end

  test "show" do
    # Admin pode ver qualquer
    admin = Usuario.create!(nome: "Admin", email: "admin2+proposta_policy@example.com", login: "admin2_prop_pol", password: "secret123", role: :admin)
    assert PropostaPolicy.new(admin, @proposta2).show?
    # Dono pode ver
    assert PropostaPolicy.new(@user1, @proposta1).show?
    # Outro corretor não pode ver a proposta do usuário 2
    refute PropostaPolicy.new(@user1, @proposta2).show?
  end

  test "create" do
    assert PropostaPolicy.new(@user1, Proposta.new).create?
  end

  test "aceitar/recusar/cancelar" do
    # Regra: admin ou corretor dono do imovel podem realizar ações
    admin = Usuario.create!(nome: "Admin", email: "admin3+proposta_policy@example.com", login: "admin3_prop_pol", password: "secret123", role: :admin)
    assert PropostaPolicy.new(admin, @proposta2).aceitar?
    assert PropostaPolicy.new(admin, @proposta2).recusar?
    assert PropostaPolicy.new(admin, @proposta2).cancelar?

    # Corretor dono do imóvel 1 (user1) pode agir sobre proposta1 cujo imovel1 pertence a user1
    assert PropostaPolicy.new(@user1, @proposta1).aceitar?
    assert PropostaPolicy.new(@user1, @proposta1).recusar?
    assert PropostaPolicy.new(@user1, @proposta1).cancelar?

    # Corretor user1 não pode agir sobre proposta2 cujo imovel2 pertence a user2
    refute PropostaPolicy.new(@user1, @proposta2).aceitar?
    refute PropostaPolicy.new(@user1, @proposta2).recusar?
    refute PropostaPolicy.new(@user1, @proposta2).cancelar?
  end
end
