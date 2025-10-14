# app/policies/audit_trail_policy.rb
class AuditTrailPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      scope.all
    end
  end

  def index?
    user&.admin_like?
  end
end