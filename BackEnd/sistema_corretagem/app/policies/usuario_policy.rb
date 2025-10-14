# app/policies/usuario_policy.rb
class UsuarioPolicy < ApplicationPolicy
  # Scope para a action 'index'.
  class Scope < ApplicationPolicy::Scope
    def resolve
      # Admin-like (admin ou gerente) podem listar todos os usuários.
      if admin_like?
        scope.all
      else
        # Para todos os outros (incluindo não logados), não retorna ninguém.
        scope.none
      end
    end
  end

  # Um admin-like pode ver qualquer perfil.
  # Um usuário pode ver seu próprio perfil.
  def show?
    admin_like? || record == user
  end

  # Um usuário pode ser criado se:
  # 1. Não houver ninguém logado (cadastro público).
  # 2. O usuário logado for admin-like.
  def create?
    !user || admin_like?
  end

  # Admin-like pode atualizar qualquer perfil.
  # Um usuário pode atualizar seu próprio perfil.
  def update?
    admin_like? || record == user
  end

  # Regra customizada para a nossa ação 'deactivate'.
  # Admin-like pode desativar outro usuário, mas não a si mesmo.
  def deactivate?
    admin_like? && record != user
  end

  # Permissões para sessões
  # Qualquer usuário autenticado pode realizar logout do próprio usuário.
  def logout?
    user.present? && record == user
  end

  # Qualquer usuário autenticado pode realizar logout em todos os seus dispositivos.
  def logout_all?
    user.present? && record == user
  end
end