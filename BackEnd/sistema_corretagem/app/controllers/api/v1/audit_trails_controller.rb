# app/controllers/api/v1/audit_trails_controller.rb
class Api::V1::AuditTrailsController < ApplicationController
  require 'csv'

  # GET /api/v1/audit_trails
  # Filtros suportados (query params):
  # - user_id
  # - event_action (evita conflito com params[:action] do Rails; alias do "action")
  # - target_type (mapeado para entity_type)
  # - severity (info|warning|error|critical)
  # - start_date (YYYY-MM-DD)
  # - end_date (YYYY-MM-DD)
  # - format (json|csv) -> default json
  def index
    authorize AuditTrail

    scope = policy_scope(AuditTrail).order(created_at: :desc)

    # Filtros
    scope = scope.where(usuario_id: params[:user_id]) if params[:user_id].present?
    event_action = params[:event_action].presence || request.query_parameters['action'].presence
    scope = scope.where(action: event_action) if event_action.present?
    scope = scope.where(entity_type: params[:target_type]) if params[:target_type].present?
    scope = scope.where(severity: params[:severity]) if params[:severity].present?

    if params[:start_date].present?
      begin
        sd = Time.zone.parse(params[:start_date]).beginning_of_day
        scope = scope.where('created_at >= ?', sd)
      rescue ArgumentError
        # Ignora start_date inválido
      end
    end

    if params[:end_date].present?
      begin
        ed = Time.zone.parse(params[:end_date]).end_of_day
        scope = scope.where('created_at <= ?', ed)
      rescue ArgumentError
        # Ignora end_date inválido
      end
    end

    # Paginação
    pagy_obj, records = pagy(scope)

    fmt = (params[:format] || 'json').to_s.downcase
    if fmt == 'csv'
      csv_str = CSV.generate(headers: true) do |csv|
        csv << %w[id created_at usuario_id action severity entity_type entity_id correlation_id ip user_agent old_value new_value details]
        records.each do |r|
          csv << [
            r.id,
            r.created_at,
            r.usuario_id,
            r.action,
            r.severity,
            r.entity_type,
            r.entity_id,
            r.correlation_id,
            r.ip,
            r.user_agent,
            (r.old_value ? r.old_value.to_json : nil),
            (r.new_value ? r.new_value.to_json : nil),
            (r.details ? r.details.to_json : nil)
          ]
        end
      end

      filename = "audit_trails_#{Time.zone.now.strftime('%Y%m%d_%H%M%S')}.csv"
      response.headers['Content-Disposition'] = "attachment; filename=\"#{filename}\""
      render plain: csv_str, content_type: 'text/csv'
    else
      json = records.map do |r|
        {
          id: r.id,
          created_at: r.created_at,
          usuario_id: r.usuario_id,
          action: r.action,
          severity: r.severity,
          entity_type: r.entity_type,
          entity_id: r.entity_id,
          correlation_id: r.correlation_id,
          ip: r.ip,
          user_agent: r.user_agent,
          old_value: r.old_value,
          new_value: r.new_value,
          details: r.details,
          changes: compute_changes(r.old_value, r.new_value)
        }
      end
      render json: { data: json, meta: pagy_metadata(pagy_obj) }
    end
  end

  private

  # Gera um diff simples entre old_value e new_value (quando ambos são Hash)
  def compute_changes(old_value, new_value)
    return nil unless old_value.is_a?(Hash) && new_value.is_a?(Hash)
    keys = (old_value.keys + new_value.keys).uniq
    changes = {}
    keys.each do |k|
      ov = old_value[k]
      nv = new_value[k]
      next if ov == nv
      changes[k] = { from: ov, to: nv }
    end
    changes
  end
end