# app/controllers/api/v1/perfis_busca_controller.rb
class Api::V1::PerfisBuscaController < ApplicationController
  before_action :authorized
  before_action :set_cliente

  # GET /api/v1/clientes/:cliente_id/perfis_busca
  def index
    @perfis = @cliente.perfis_busca
    render json: @perfis, each_serializer: PerfilBuscaSerializer
  end
  
  # GET /api/v1/clientes/:cliente_id/perfis_busca/:id
  def show
    @perfil = @cliente.perfis_busca.find(params[:id])
    render json: @perfil, serializer: PerfilBuscaSerializer
  end

  # POST /api/v1/clientes/:cliente_id/perfis_busca
  def create
    @perfil = @cliente.perfis_busca.build(perfil_busca_params)
    if @perfil.save
      render json: @perfil, status: :created, serializer: PerfilBuscaSerializer
    else
      render json: @perfil.errors, status: :unprocessable_entity
    end
  end

  # PATCH /api/v1/clientes/:cliente_id/perfis_busca/:id
  def update
    @perfil = @cliente.perfis_busca.find(params[:id])
    if @perfil.update(perfil_busca_params)
      render json: @perfil, serializer: PerfilBuscaSerializer
    else
      render json: @perfil.errors, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/clientes/:cliente_id/perfis_busca/:id
  def destroy
    @perfil = @cliente.perfis_busca.find(params[:id])
    @perfil.destroy
    head :no_content
  end

  private

  def set_cliente
    # Lógica de autorização melhorada para o admin
    if current_user.admin?
      @cliente = Cliente.find(params[:cliente_id])
    else
      @cliente = current_user.clientes.find(params[:cliente_id])
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Cliente não encontrado ou não pertence a você." }, status: :not_found
  end

  def perfil_busca_params
    params.require(:perfil_busca).permit(
      :titulo_busca, :finalidade, :condicao,
      :valor_maximo_imovel, :valor_entrada_disponivel, :renda_minima_exigida,
      :quartos_minimo, :suites_minimo, :banheiros_minimo, :vagas_minimo,
      :metragem_minima, :exige_varanda,
      bairro_preferencia: []
    )
  end
end