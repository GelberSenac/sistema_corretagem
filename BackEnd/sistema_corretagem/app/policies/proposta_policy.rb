# app/policies/proposta_policy.rb
class PropostaPolicy < ApplicationPolicy
  # Scope para a action 'index'
  class Scope < ApplicationPolicy::Scope
    def resolve
      if admin_like?
        scope.all
      else
        scope.joins(:cliente).where(clientes: { usuario_id: user&.id })
      end
    end
  end

  # Um usuário pode ver uma proposta se for admin-like ou se ele a criou.
  def show?
    admin_like? || record.usuario_id == user.id || record.cliente.usuario_id == user.id
  end

  # Apenas corretores e administradores podem criar uma proposta.
  def create?
    user&.corretor? || user&.admin?
  end

  # Atualizar proposta: admin-like ou corretor que criou a proposta
  def update?
    admin_like? || record.usuario_id == user.id
  end

  # Excluir proposta: admin-like ou corretor que criou a proposta
  def destroy?
    admin_like? || record.usuario_id == user.id
  end

  # --- Regras para as Ações Customizadas ---
  # Apenas admin-like ou o corretor dono do IMÓVEL podem aceitar, recusar ou cancelar.
  def aceitar?
    admin_like? || user.id == record.imovel.usuario_id
  end

  def recusar?
    admin_like? || user.id == record.imovel.usuario_id
  end

  def cancelar?
    admin_like? || user.id == record.imovel.usuario_id
  end
end