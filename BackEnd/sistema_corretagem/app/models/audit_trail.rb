# app/models/audit_trail.rb
class AuditTrail < ApplicationRecord
  belongs_to :usuario, optional: true

  validates :action, presence: true
  validates :severity, inclusion: { in: %w[info warning error critical] }

  # Log estruturado
  def self.log(user:, action:, entity: nil, severity: 'info', correlation_id: nil, ip: nil, user_agent: nil, old_value: nil, new_value: nil, details: nil)
    create!(
      usuario: user,
      action: action,
      severity: severity,
      entity_type: entity&.class&.name,
      entity_id: entity&.id,
      correlation_id: correlation_id,
      ip: ip,
      user_agent: user_agent,
      old_value: old_value,
      new_value: new_value,
      details: details
    )
  rescue => e
    Rails.logger.error("[AuditTrail] Falha ao registrar auditoria: #{e.message}")
  end
end