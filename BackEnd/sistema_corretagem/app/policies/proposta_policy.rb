# app/policies/proposta_policy.rb
class PropostaPolicy < ApplicationPolicy
  # Scope para a action 'index'
  class Scope < Scope
    def resolve
      if user.admin?
        # Admins veem todas as propostas.
        scope.all
      else
        # Corretores veem apenas as propostas que eles criaram.
        user.propostas
      end
    end
  end

  # Um usuário pode ver uma proposta se for admin ou se ele a criou.
  def show?
    user.admin? || record.usuario_id == user.id
  end

  # Qualquer corretor logado pode criar uma proposta.
  def create?
    user.present?
  end

  # --- Regras para as Ações Customizadas ---
  # Apenas o admin ou o corretor dono do IMÓVEL podem aceitar, recusar ou cancelar.
  
  def aceitar?
    user.admin? || user.id == record.imovel.usuario_id
  end

  def recusar?
    user.admin? || user.id == record.imovel.usuario_id
  end

  def cancelar?
    user.admin? || user.id == record.imovel.usuario_id
  end
end