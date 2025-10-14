# frozen_string_literal: true

class ApplicationPolicy
  attr_reader :user, :record

  def initialize(user, record)
    @user = user
    @record = record
  end

  # Helper para papéis com poderes de administração.
  # Considera tanto 'admin' quanto 'gerente' como perfis com privilégios ampliados.
  def admin_like?
    user&.admin? || user&.gerente?
  end

  def index?
    false
  end

  def show?
    false
  end

  def create?
    false
  end

  def new?
    create?
  end

  def update?
    false
  end

  def edit?
    update?
  end

  def destroy?
    false
  end

  class Scope
    def initialize(user, scope)
      @user = user
      @scope = scope
    end

    # Helper disponível dentro das Scopes para verificar perfis admin_like
    def admin_like?
      user&.admin? || user&.gerente?
    end

    def resolve
      raise NoMethodError, "You must define #resolve in #{self.class}"
    end

    private

    attr_reader :user, :scope
  end
end
