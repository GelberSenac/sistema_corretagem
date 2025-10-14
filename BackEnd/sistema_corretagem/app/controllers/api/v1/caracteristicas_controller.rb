# app/controllers/api/v1/caracteristicas_controller.rb
class Api::V1::CaracteristicasController < ApplicationController
  # GET /api/v1/caracteristicas
  def index
    @caracteristicas = Caracteristica.order(:nome)
    render json: @caracteristicas.as_json(only: [:id, :nome, :categoria])
  end
end