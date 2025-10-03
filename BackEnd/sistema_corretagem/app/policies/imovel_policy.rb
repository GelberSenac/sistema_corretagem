# app/policies/imovel_policy.rb
class ImovelPolicy < ApplicationPolicy
  # Scope para a action 'index'
  class Scope < Scope
    def resolve
      if user.admin?
        # Admins podem ver todos os imóveis.
        scope.all
      else
        # Corretores podem ver apenas os seus imóveis.
        user.imoveis
      end
    end
  end

  # Qualquer usuário logado pode ver os detalhes de um imóvel.
  def show?
    true
  end

  # Qualquer usuário logado (corretor) pode criar um imóvel.
  def create?
    user.present?
  end

  # Apenas o admin ou o corretor que cadastrou o imóvel podem atualizá-lo.
  def update?
    user.admin? || record.usuario_id == user.id
  end

  # Apenas o admin ou o corretor que cadastrou o imóvel podem excluí-lo.
  def destroy?
    user.admin? || record.usuario_id == user.id
  end
end