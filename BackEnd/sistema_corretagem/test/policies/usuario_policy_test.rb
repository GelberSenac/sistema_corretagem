require 'test_helper'

class UsuarioPolicyTest < ActiveSupport::TestCase
  setup do
    @user1 = usuarios(:one)
    @user2 = usuarios(:two)
  end

  def test_scope
    # Admin lista todos os usuários
    admin = Usuario.create!(nome: "Admin", email: "admin+usuario_policy@example.com", login: "admin_usuario_pol", password: "secret123", role: :admin)
    scope_admin = UsuarioPolicy::Scope.new(admin, Usuario).resolve
    assert_equal Usuario.order(:id).pluck(:id), scope_admin.order(:id).pluck(:id)

    # Usuário comum não lista ninguém
    scope_user1 = UsuarioPolicy::Scope.new(@user1, Usuario).resolve
    assert_empty scope_user1
  end

  def test_show
    # Admin pode ver qualquer usuário
    admin = Usuario.create!(nome: "Admin", email: "admin2+usuario_policy@example.com", login: "admin2_usuario_pol", password: "secret123", role: :admin)
    assert UsuarioPolicy.new(admin, @user1).show?

    # Usuário pode ver a si mesmo
    assert UsuarioPolicy.new(@user1, @user1).show?

    # Usuário comum não pode ver outro usuário
    refute UsuarioPolicy.new(@user1, @user2).show?
  end

  def test_create
    # Sem usuário logado (nil) pode criar (cadastro público)
    assert UsuarioPolicy.new(nil, Usuario.new).create?

    # Admin pode criar
    admin = Usuario.create!(nome: "Admin", email: "admin3+usuario_policy@example.com", login: "admin3_usuario_pol", password: "secret123", role: :admin)
    assert UsuarioPolicy.new(admin, Usuario.new).create?

    # Usuário comum não pode criar outro usuário
    refute UsuarioPolicy.new(@user1, Usuario.new).create?
  end

  def test_update
    # Admin pode atualizar qualquer
    admin = Usuario.create!(nome: "Admin", email: "admin4+usuario_policy@example.com", login: "admin4_usuario_pol", password: "secret123", role: :admin)
    assert UsuarioPolicy.new(admin, @user1).update?

    # Usuário pode atualizar a si mesmo
    assert UsuarioPolicy.new(@user1, @user1).update?

    # Usuário não pode atualizar outro
    refute UsuarioPolicy.new(@user1, @user2).update?
  end

  def test_destroy
    # Não há regra destroy explícita em UsuarioPolicy, herdaria false da ApplicationPolicy
    # Validamos que tanto admin quanto usuário comum não podem destruir via policy base
    admin = Usuario.create!(nome: "Admin", email: "admin5+usuario_policy@example.com", login: "admin5_usuario_pol", password: "secret123", role: :admin)
    refute ApplicationPolicy.new(admin, @user1).destroy?
    refute ApplicationPolicy.new(@user1, @user2).destroy?
  end
end
