# app/controllers/api/v1/lancamento_financeiros_controller.rb
class Api::V1::LancamentoFinanceirosController < ApplicationController
  before_action :authorized

  def index
    @lancamentos = policy_scope(LancamentoFinanceiro)

    @pagy, @lancamentos = pagy(@lancamentos.order(data: :desc), limit: per_page_limit)
    pagy_headers_merge(@pagy)

    render json: @lancamentos, each_serializer: LancamentoFinanceiroSerializer
  end
end
