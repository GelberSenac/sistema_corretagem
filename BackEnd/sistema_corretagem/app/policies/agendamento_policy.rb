# app/policies/agendamento_policy.rb
class AgendamentoPolicy
  attr_reader :user, :record

  def initialize(user, record)
    @user = user
    @record = record
  end

  def index?
    true
  end

  def show?
    admin? || owns_record?
  end

  def create?
    admin? || corretor?
  end

  def update?
    admin? || owns_record?
  end

  def destroy?
    admin? || owns_record?
  end

  def admin?
    user&.role == 'admin' || user&.role == 'gerente'
  end

  def corretor?
    user&.role == 'corretor'
  end

  def owns_record?
    record.usuario_id == user&.id
  end

  class Scope < Struct.new(:user, :scope)
    def resolve
      if user&.role == 'admin' || user&.role == 'gerente'
        scope.all
      else
        scope.where(usuario_id: user.id)
      end
    end
  end
end