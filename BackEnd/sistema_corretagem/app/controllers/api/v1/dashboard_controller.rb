# app/controllers/api/v1/dashboard_controller.rb
class Api::V1::DashboardController < ApplicationController
  before_action :authorized

  def index
    # Verificamos o papel do usuário logado para decidir quais dados enviar
    if current_user.admin?
      render json: admin_dashboard_data
    elsif current_user.corretor?
      render json: corretor_dashboard_data
    else
      # Para outros papéis (como gerente), podemos retornar um dashboard padrão
      render json: { message: "Bem-vindo!" }
    end
  end

  private

  # --- Métodos Privados para Organizar a Lógica ---

  # Coleta os dados para o dashboard do Administrador
  def admin_dashboard_data
    total_usuarios = Usuario.count
    total_admins = Usuario.where(role: :admin).count
    total_corretores = Usuario.where(role: :corretor).count

    {
      tipo_dashboard: 'admin',
      total_usuarios: total_usuarios,
      total_admins: total_admins,
      total_corretores: total_corretores,
      total_imoveis_cadastrados: Imovel.count 
    }
  end

  # Coleta os dados para o dashboard do Corretor
  def corretor_dashboard_data
    # Usamos a associação 'current_user.propostas' para pegar apenas as propostas do corretor logado
    propostas_por_status = current_user.propostas.group(:status).count
    total_clientes = current_user.clientes.count

    {
      tipo_dashboard: 'corretor',
      total_clientes: total_clientes,
      total_imoveis_agenciados: current_user.imoveis.count,
      propostas_por_status: current_user.propostas.group(:status).count
    }
  end
end