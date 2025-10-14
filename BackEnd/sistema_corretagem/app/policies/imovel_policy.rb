# app/policies/imovel_policy.rb
class ImovelPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      if admin_like?
        scope.all
      else
        scope.where(usuario_id: user&.id)
      end
    end
  end

  # Qualquer usuário logado pode ver os detalhes de um imóvel.
  def show?
    user.present?
  end

  # Qualquer usuário logado (corretor ou admin-like) pode criar um imóvel.
  def create?
    user.present?
  end

  # Admin-like ou o corretor que cadastrou o imóvel podem atualizá-lo.
  def update?
    admin_like? || record.usuario_id == user.id
  end

  # Admin-like ou o corretor que cadastrou o imóvel podem excluí-lo.
  def destroy?
    admin_like? || record.usuario_id == user.id
  end
end