# app/controllers/dashboard_controller.rb

class DashboardController < ApplicationController
  def index
    # Conta os usuários ativos (ativo: true) e inativos (ativo: false)
    ativos = Usuario.where(ativo: true).count
    inativos = Usuario.where(ativo: false).count
    
    # Retorna os dados em formato JSON
    render json: {
      ativos: ativos,
      inativos: inativos,
      total: ativos + inativos
    }
  end
end