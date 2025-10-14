require 'test_helper'

class ImovelPolicyTest < ActiveSupport::TestCase
  setup do
    @user1 = usuarios(:one)
    @user2 = usuarios(:two)
    @imovel1 = imoveis(:one)
    @imovel2 = imoveis(:two)
  end

  test "scope" do
    # Admin vê todos
    admin = Usuario.create!(nome: "Admin", email: "admin+imovel_policy@example.com", login: "admin_imovel_policy", password: "secret123", role: :admin)
    scope_admin = ImovelPolicy::Scope.new(admin, Imovel).resolve
    assert_equal Imovel.order(:id).pluck(:id), scope_admin.order(:id).pluck(:id)

    # Corretor vê apenas seus imóveis
    scope_user1 = ImovelPolicy::Scope.new(@user1, Imovel).resolve
    assert_equal @user1.imoveis.order(:id).pluck(:id), scope_user1.order(:id).pluck(:id)
  end

  test "show" do
    assert ImovelPolicy.new(@user1, @imovel1).show?
  end

  test "create" do
    assert ImovelPolicy.new(@user1, Imovel.new).create?
  end

  test "update" do
    # Dono pode atualizar
    assert ImovelPolicy.new(@user1, @imovel1).update?
    # Outro corretor não pode
    refute ImovelPolicy.new(@user1, @imovel2).update?
    # Admin pode
    admin = Usuario.create!(nome: "Admin", email: "admin2+imovel_policy@example.com", login: "admin2_imovel_policy", password: "secret123", role: :admin)
    assert ImovelPolicy.new(admin, @imovel2).update?
  end

  test "destroy" do
    # Dono pode destruir
    assert ImovelPolicy.new(@user1, @imovel1).destroy?
    # Outro corretor não pode
    refute ImovelPolicy.new(@user1, @imovel2).destroy?
    # Admin pode
    admin = Usuario.create!(nome: "Admin", email: "admin3+imovel_policy@example.com", login: "admin3_imovel_policy", password: "secret123", role: :admin)
    assert ImovelPolicy.new(admin, @imovel2).destroy?
  end
end
