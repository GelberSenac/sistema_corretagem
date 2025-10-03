# app/controllers/api/v1/caracteristicas_controller.rb
class Api::V1::CaracteristicasController < ApplicationController
  before_action :authorized

  # GET /api/v1/caracteristicas
  def index
    @caracteristicas = Caracteristica.order(:nome) # Busca todas e ordena por nome
    render json: @caracteristicas
  end
end