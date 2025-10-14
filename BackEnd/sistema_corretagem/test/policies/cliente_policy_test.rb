require 'test_helper'

class ClientePolicyTest < ActiveSupport::TestCase
  setup do
    @user1 = usuarios(:one)
    @user2 = usuarios(:two)
    @cliente1 = clientes(:one)
    @cliente2 = clientes(:two)
  end

  test "scope" do
    # Admin vê todos
    admin = Usuario.create!(nome: "Admin", email: "admin+cliente_policy@example.com", login: "admin_cliente_pol", password: "secret123", role: :admin)
    scope_admin = ClientePolicy::Scope.new(admin, Cliente).resolve
    assert_equal Cliente.order(:id).pluck(:id), scope_admin.order(:id).pluck(:id)

    # Corretor vê apenas seus clientes
    scope_user1 = ClientePolicy::Scope.new(@user1, Cliente).resolve
    assert_equal @user1.clientes.order(:id).pluck(:id), scope_user1.order(:id).pluck(:id)
  end

  test "show" do
    # Dono pode ver
    assert ClientePolicy.new(@user1, @cliente1).show?
    # Outro corretor não pode
    refute ClientePolicy.new(@user1, @cliente2).show?
    # Admin pode ver qualquer
    admin = Usuario.create!(nome: "Admin", email: "admin2+cliente_policy@example.com", login: "admin2_cliente_pol", password: "secret123", role: :admin)
    assert ClientePolicy.new(admin, @cliente2).show?
  end

  test "create" do
    assert ClientePolicy.new(@user1, Cliente.new).create?
  end

  test "update" do
    # Dono pode atualizar
    assert ClientePolicy.new(@user1, @cliente1).update?
    # Outro corretor não pode
    refute ClientePolicy.new(@user1, @cliente2).update?
    # Admin pode
    admin = Usuario.create!(nome: "Admin", email: "admin3+cliente_policy@example.com", login: "admin3_cliente_pol", password: "secret123", role: :admin)
    assert ClientePolicy.new(admin, @cliente2).update?
  end

  test "destroy" do
    # Dono pode destruir
    assert ClientePolicy.new(@user1, @cliente1).destroy?
    # Outro corretor não pode
    refute ClientePolicy.new(@user1, @cliente2).destroy?
    # Admin pode
    admin = Usuario.create!(nome: "Admin", email: "admin4+cliente_policy@example.com", login: "admin4_cliente_pol", password: "secret123", role: :admin)
    assert ClientePolicy.new(admin, @cliente2).destroy?
  end
end
