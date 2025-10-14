# app/policies/cliente_policy.rb
class ClientePolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      if admin_like?
        scope.all
      else
        # Corretores veem apenas os seus clientes (coluna correta: usuario_id)
        scope.where(usuario_id: user&.id)
      end
    end
  end

  def show?
    admin_like? || record.usuario_id == user&.id
  end

  def create?
    admin_like? || user.present?
  end

  def update?
    admin_like? || record.usuario_id == user&.id
  end

  def destroy?
    admin_like?
  end
end