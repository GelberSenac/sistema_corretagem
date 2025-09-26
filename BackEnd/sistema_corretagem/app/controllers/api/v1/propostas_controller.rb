# app/controllers/api/v1/propostas_controller.rb
class Api::V1::PropostasController < ApplicationController
  before_action :authorized
  before_action :set_proposta, only: [:show]

  # GET /api/v1/propostas
  # Adicionamos uma ação para listar as propostas
  def index
    # Admin vê todas as propostas, corretor vê apenas as suas
    if current_user.admin?
      @propostas = Proposta.all
    else
      @propostas = current_user.propostas
    end
    render json: @propostas, each_serializer: PropostaSerializer
  end

  # GET /api/v1/propostas/:id
  def show
    render json: @proposta, serializer: PropostaSerializer
  end

  # POST /api/v1/propostas
  def create
    # CRÍTICO: Garantimos que o cliente da proposta pertence ao corretor logado
    cliente = current_user.clientes.find(proposta_params[:cliente_id])
    imovel = Imovel.find(proposta_params[:imovel_id])

    unless imovel.disponivel?
      render json: { error: "Este imóvel não está mais disponível para propostas." }, status: :unprocessable_entity
      return
    end

    Proposta.transaction do
      @proposta = Proposta.new(proposta_params)
      @proposta.usuario = current_user
      @proposta.cliente = cliente # Associamos o cliente verificado

      if @proposta.save
        imovel.reservado!
        # Usando o serializer na resposta
        render json: @proposta, status: :created, serializer: PropostaSerializer
      else
        render json: @proposta.errors, status: :unprocessable_entity
        raise ActiveRecord::Rollback
      end
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Imóvel ou Cliente não encontrado em sua carteira." }, status: :not_found
  end

  # PATCH /api/v1/propostas/:id/aceitar
  def aceitar
    Proposta.transaction do
      @proposta.aceita!
      # Ação CRÍTICA: Se a proposta é aceita, o imóvel é vendido!
      @proposta.imovel.vendido! 
    end
    render json: @proposta, serializer: PropostaSerializer
  end

  # PATCH /api/v1/propostas/:id/recusar
  def recusar
    Proposta.transaction do
      @proposta.recusada!
      # Se a proposta é recusada, o imóvel volta a ficar disponível
      @proposta.imovel.disponivel!
    end
    render json: @proposta, serializer: PropostaSerializer
  end

  # PATCH /api/v1/propostas/:id/cancelar
  def cancelar
    Proposta.transaction do
      @proposta.cancelada!
      # Se a proposta é cancelada, o imóvel também volta a ficar disponível
      @proposta.imovel.disponivel!
    end
    render json: @proposta, serializer: PropostaSerializer
  end
    
  private

  def set_proposta
    if current_user.admin?
      @proposta = Proposta.find(params[:id])
    else
      @proposta = current_user.propostas.find(params[:id])
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Proposta não encontrada ou você não tem permissão." }, status: :not_found
  end

  def proposta_params
    params.require(:proposta).permit(
      :valor_proposta,
      :cliente_id,
      :imovel_id,
      :corretora_id,
      condicoes_pagamento: {}
    )
  end
end