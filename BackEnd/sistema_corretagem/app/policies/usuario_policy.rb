# app/policies/usuario_policy.rb
class UsuarioPolicy < ApplicationPolicy
  # Scope para a action 'index'.
  class Scope < Scope
    def resolve
      # Apenas admins podem listar todos os usuários.
      if user.admin?
        scope.all
      else
        # Para todos os outros (incluindo não logados), não retorna ninguém.
        scope.none
      end
    end
  end

  # Um admin pode ver qualquer perfil.
  # Um usuário pode ver seu próprio perfil.
  def show?
    user.admin? || record == user
  end

  # Um usuário pode ser criado se:
  # 1. Não houver ninguém logado (cadastro público).
  # 2. O usuário logado for um admin.
  def create?
    !user || user.admin?
  end

  # Um admin pode atualizar qualquer perfil.
  # Um usuário pode atualizar seu próprio perfil.
  def update?
    user.admin? || record == user
  end

  # Criamos uma regra customizada para a nossa ação 'deactivate'.
  # Um admin pode desativar outro usuário, mas não a si mesmo.
  def deactivate?
    user.admin? && record != user
  end
end