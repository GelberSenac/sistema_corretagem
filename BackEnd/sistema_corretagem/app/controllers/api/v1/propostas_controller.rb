# app/controllers/api/v1/propostas_controller.rb
class Api::V1::PropostasController < ApplicationController
  before_action :authorized
  before_action :set_proposta, only: [:show, :aceitar, :recusar, :cancelar]

  # GET /api/v1/propostas
  def index
    # Pundit usa a 'Scope' da PropostaPolicy para filtrar a coleção.
    @propostas = policy_scope(Proposta)

    # A lógica de includes e paginação continua a mesma.
    @pagy, @propostas = pagy(@propostas.includes(:cliente, :imovel, :usuario))
    pagy_headers_merge(@pagy)
    
    render json: @propostas, each_serializer: PropostaSerializer
  end

  # GET /api/v1/propostas/:id
  def show
    # Pundit verifica a regra 'show?' na policy.
    authorize @proposta
    render json: @proposta, serializer: PropostaSerializer
  end

  # POST /api/v1/propostas
  def create
    # A lógica de negócio (verificar cliente, imóvel disponível) continua aqui.
    cliente = current_user.clientes.find(proposta_params[:cliente_id])
    imovel = Imovel.find(proposta_params[:imovel_id])

    unless imovel.disponivel?
      render json: { error: "Este imóvel não está mais disponível para propostas." }, status: :unprocessable_entity
      return
    end

    @proposta = Proposta.new(proposta_params)
    @proposta.usuario = current_user
    @proposta.cliente = cliente

    # Pundit verifica se o usuário tem permissão para criar a proposta.
    authorize @proposta

    if @proposta.save
      render json: @proposta, status: :created, serializer: PropostaSerializer
    else
      render json: @proposta.errors, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Imóvel ou Cliente não encontrado na sua carteira." }, status: :not_found
  end

  # --- Ações de Mudança de Status com Autorização ---

  def aceitar
    # Pundit verifica a regra 'aceitar?'. Garante que só o dono do imóvel pode aceitar.
    authorize @proposta
    if @proposta.update(status: :aceita)
      render json: @proposta, serializer: PropostaSerializer
    else
      render json: @proposta.errors, status: :unprocessable_entity
    end
  end

  def recusar
    authorize @proposta # Pundit verifica a regra 'recusar?'
    if @proposta.update(status: :recusada)
      render json: @proposta, serializer: PropostaSerializer
    else
      render json: @proposta.errors, status: :unprocessable_entity
    end
  end

  def cancelar
    authorize @proposta # Pundit verifica a regra 'cancelar?'
    if @proposta.update(status: :cancelada)
      render json: @proposta, serializer: PropostaSerializer
    else
      render json: @proposta.errors, status: :unprocessable_entity
    end
  end
    
  private

  def set_proposta
    # O método fica simples, apenas encontra o registro.
    @proposta = Proposta.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Proposta não encontrada." }, status: :not_found
  end

  # O método de parâmetros fortes continua o mesmo.
  def proposta_params
    params.require(:proposta).permit(
      :valor_proposta, :cliente_id, :imovel_id, :corretora_id, :data_proposta,
      condicoes_pagamento: {}
    )
  end
end