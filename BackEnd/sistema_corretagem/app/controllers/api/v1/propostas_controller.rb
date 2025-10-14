# app/controllers/api/v1/propostas_controller.rb
class Api::V1::PropostasController < ApplicationController
  before_action :authorized
  before_action :set_proposta, only: [:show, :update, :destroy]

  def index
    @propostas = policy_scope(Proposta).includes(:cliente, :imovel, :usuario)

    @pagy, @propostas = pagy(@propostas.order(created_at: :desc), limit: per_page_limit)
    pagy_headers_merge(@pagy)

    render json: @propostas, each_serializer: PropostaSerializer
  end

  def show
    authorize @proposta
    render json: @proposta, serializer: PropostaSerializer
  end

  def create
    authorize Proposta

    attrs = proposta_params.to_h.symbolize_keys

    # Coerção segura de condicoes_pagamento para JSON
    if attrs.key?(:condicoes_pagamento)
      cond = attrs[:condicoes_pagamento]
      if cond.is_a?(String)
        begin
          parsed = JSON.parse(cond)
          attrs[:condicoes_pagamento] = parsed
        rescue JSON::ParserError
          attrs[:condicoes_pagamento] = { observacoes: cond }
        end
      end
    end

    # Atribui o usuário atual e data da proposta
    attrs[:usuario_id] = current_user.id
    attrs[:data_proposta] ||= Time.current

    proposta = Proposta.new(attrs.except(:perfil_busca_id))

    # Se veio perfil_busca_id, cria snapshot no momento da criação
    if proposta_params[:perfil_busca_id].present?
      perfil = PerfilBusca.find_by(id: proposta_params[:perfil_busca_id])
      if perfil.nil?
        return render json: { error: "Perfil de busca inexistente." }, status: :unprocessable_entity
      end

      # Segurança: garante que o perfil pertence ao mesmo cliente da proposta
      if perfil.cliente_id.to_s != proposta.cliente_id.to_s
        return render json: { error: "Perfil de busca não pertence ao cliente selecionado." }, status: :unprocessable_entity
      end

      proposta.perfil_busca = perfil
      # Usa o serializer existente para gerar um snapshot consistente
      snapshot = ActiveModelSerializers::SerializableResource.new(perfil, serializer: PerfilBuscaSerializer).as_json
      proposta.perfil_busca_snapshot = snapshot
    end

    if proposta.save
      AuditTrail.log(
        user: current_user,
        action: 'proposta_create',
        severity: 'info',
        correlation_id: request.request_id,
        ip: request.remote_ip,
        user_agent: request.user_agent,
        entity: proposta,
        new_value: proposta.attributes
      )
      render json: proposta, serializer: PropostaSerializer, status: :created
    else
      AuditTrail.log(
        user: current_user,
        action: 'proposta_create_failed',
        severity: 'warning',
        correlation_id: request.request_id,
        ip: request.remote_ip,
        user_agent: request.user_agent,
        details: { errors: proposta.errors.full_messages }
      )
      render json: { error: proposta.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end

  def update
    authorize @proposta

    update_attrs = proposta_params.to_h.symbolize_keys.slice(:valor_proposta, :condicoes_pagamento)

    # Coerção segura de condicoes_pagamento para JSON
    if update_attrs.key?(:condicoes_pagamento)
      cond = update_attrs[:condicoes_pagamento]
      if cond.is_a?(String)
        begin
          parsed = JSON.parse(cond)
          update_attrs[:condicoes_pagamento] = parsed
        rescue JSON::ParserError
          update_attrs[:condicoes_pagamento] = { observacoes: cond }
        end
      end
    end

    if @proposta.update(update_attrs)
      AuditTrail.log(
        user: current_user,
        action: 'proposta_update',
        severity: 'info',
        correlation_id: request.request_id,
        ip: request.remote_ip,
        user_agent: request.user_agent,
        entity: @proposta,
        new_value: @proposta.attributes
      )
      render json: @proposta, serializer: PropostaSerializer
    else
      AuditTrail.log(
        user: current_user,
        action: 'proposta_update_failed',
        severity: 'warning',
        correlation_id: request.request_id,
        ip: request.remote_ip,
        user_agent: request.user_agent,
        details: { errors: @proposta.errors.full_messages }
      )
      render json: { error: @proposta.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end

  def destroy
    authorize @proposta

    if @proposta.destroy
      AuditTrail.log(
        user: current_user,
        action: 'proposta_destroy',
        severity: 'info',
        correlation_id: request.request_id,
        ip: request.remote_ip,
        user_agent: request.user_agent,
        entity: @proposta,
        old_value: @proposta.attributes
      )
      head :no_content
    else
      AuditTrail.log(
        user: current_user,
        action: 'proposta_destroy_failed',
        severity: 'warning',
        correlation_id: request.request_id,
        ip: request.remote_ip,
        user_agent: request.user_agent,
        details: { errors: @proposta.errors.full_messages }
      )
      render json: { error: @proposta.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end

  private

  def proposta_params
    # Permitimos 'condicoes_pagamento' tanto como ESCALAR (string) quanto como HASH (JSON),
    # para aceitar entradas do frontend que enviam texto livre ou JSON serializado.
    params.require(:proposta).permit(
      :cliente_id,
      :imovel_id,
      :valor_proposta,
      :data_proposta,
      :perfil_busca_id,
      :condicoes_pagamento,
      condicoes_pagamento: {}
    )
  end

  def set_proposta
    @proposta = Proposta.find(params[:id])
  end
end