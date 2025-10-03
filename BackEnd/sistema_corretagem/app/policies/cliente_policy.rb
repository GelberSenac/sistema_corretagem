# app/policies/cliente_policy.rb
class ClientePolicy < ApplicationPolicy
  # A classe Scope é usada para filtrar coleções (para a action 'index').
  class Scope < Scope
    def resolve
      if user.admin?
        # Se for admin, o escopo é 'todos os clientes'.
        scope.all
      else
        # Se não for, o escopo são 'apenas os clientes que pertencem ao usuário (corretor)'.
        user.clientes
      end
    end
  end

  # Regra para a action 'show'.
  # O usuário pode ver o cliente se for admin OU se o cliente for dele.
  def show?
    user.admin? || record.usuario_id == user.id
  end

  # Regra para a action 'create'.
  # Qualquer usuário logado (corretor ou admin) pode criar um cliente.
  def create?
    user.present?
  end

  # Regra para a action 'update'. Mesma regra do 'show'.
  def update?
    user.admin? || record.usuario_id == user.id
  end

  # Regra para a action 'destroy'. Mesma regra do 'show'.
  def destroy?
    user.admin? || record.usuario_id == user.id
  end
end