class Api::V1::AgendamentosController < ApplicationController
  before_action :set_agendamento, only: [:show, :update, :destroy]

  # GET /api/v1/agendamentos
  def index
    @agendamentos = Agendamento.all
    render json: @agendamentos
  end

  # GET /api/v1/agendamentos/:id
  def show
    render json: @agendamento
  end

  # POST /api/v1/agendamentos
  def create
    @agendamento = Agendamento.new(agendamento_params)

    if @agendamento.save
      render json: @agendamento, status: :created
    else
      render json: @agendamento.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/agendamentos/:id
  def update
    if @agendamento.update(agendamento_params)
      render json: @agendamento
    else
      render json: @agendamento.errors, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/agendamentos/:id
  def destroy
    @agendamento.destroy
  end

  private

  def set_agendamento
    @agendamento = Agendamento.find(params[:id])
  end

  def agendamento_params
    params.require(:agendamento).permit(:titulo, :descricao, :data_inicio, :data_fim, :local, :status, :usuario_id, :cliente_id, :imovel_id)
  end
end
