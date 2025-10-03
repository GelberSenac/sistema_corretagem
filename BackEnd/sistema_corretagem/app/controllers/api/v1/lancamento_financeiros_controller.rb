class Api::V1::LancamentoFinanceirosController < ApplicationController
  before_action :set_lancamento_financeiro, only: [:show, :update, :destroy]

  # GET /api/v1/lancamento_financeiros
  def index
    @lancamentos = LancamentoFinanceiro.all
    render json: @lancamentos
  end

  # GET /api/v1/lancamento_financeiros/1
  def show
    render json: @lancamento
  end

  # POST /api/v1/lancamento_financeiros
  def create
    @lancamento = LancamentoFinanceiro.new(lancamento_financeiro_params)

    if @lancamento.save
      render json: @lancamento, status: :created
    else
      render json: @lancamento.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/lancamento_financeiros/1
  def update
    if @lancamento.update(lancamento_financeiro_params)
      render json: @lancamento
    else
      render json: @lancamento.errors, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/lancamento_financeiros/1
  def destroy
    @lancamento.destroy
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_lancamento_financeiro
      @lancamento = LancamentoFinanceiro.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def lancamento_financeiro_params
      params.require(:lancamento_financeiro).permit(:descricao, :valor, :tipo, :data_lancamento, :usuario_id, :proposta_id)
    end
end
