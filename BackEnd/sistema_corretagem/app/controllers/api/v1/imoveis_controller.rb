# app/controllers/api/v1/imoveis_controller.rb
class Api::V1::ImoveisController < ApplicationController
  before_action :authorized
  before_action :set_imovel, only: [:show, :update, :destroy]

  # GET /api/v1/imoveis (com filtros dinâmicos)
  def index
    # 1. Pundit busca a base de imóveis correta (todos para admin, só do corretor para ele).
    base_imoveis = policy_scope(Imovel)
    
    # 2. Aplicamos os includes, os filtros e a paginação.
    imoveis_filtrados = base_imoveis.includes(:endereco, :caracteristicas)
                                    .por_bairro(params[:bairro])
                                    .com_valor_minimo(params[:valor_minimo])
                                    .com_valor_maximo(params[:valor_maximo])
                                    .com_quartos_minimo(params[:quartos_minimo])
                                    .com_tipo(params[:tipo])

    @pagy, @imoveis = pagy(imoveis_filtrados)
    pagy_headers_merge(@pagy)

    render json: @imoveis, each_serializer: ImovelSerializer
  end

  # GET /api/v1/imoveis/:id
  def show
    # Pundit verifica a regra 'show?' na policy.
    authorize @imovel
    render json: @imovel, serializer: ImovelSerializer
  end

  # POST /api/v1/imoveis
  def create
    @imovel = current_user.imoveis.build(imovel_params)
    # Pundit verifica a regra 'create?'.
    authorize @imovel

    if @imovel.save
      render json: @imovel, status: :created, serializer: ImovelSerializer
    else
      render json: @imovel.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/imoveis/:id
  def update
    # Pundit verifica a regra 'update?'.
    authorize @imovel
    if @imovel.update(imovel_params)
      render json: @imovel, serializer: ImovelSerializer
    else
      render json: @imovel.errors, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/imoveis/:id
  def destroy
    # Pundit verifica a regra 'destroy?'.
    authorize @imovel
    @imovel.destroy
    head :no_content
  end

  # GET /api/v1/imoveis/buscar
  def buscar
    perfil = PerfilBusca.find(params[:perfil_busca_id])
    
    # Esta busca pode ser melhorada usando scopes no futuro, mas por agora está funcional.
    @imoveis = Imovel.where(status: :disponivel)
                     .where("valor <= ?", perfil.valor_maximo_imovel) if perfil.valor_maximo_imovel.present?
    # ... outros filtros ...

    render json: @imoveis, each_serializer: ImovelSerializer
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Perfil de busca não encontrado." }, status: :not_found
  end

  private

  def set_imovel
    # Simplificado: apenas encontra o imóvel. A autorização é feita pelo 'authorize'.
    @imovel = Imovel.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Imóvel não encontrado." }, status: :not_found
  end

  def imovel_params
    params.require(:imovel).permit(
      :nome_empreendimento, :tipo, :finalidade, :condicao, :descricao, :status,
      :quartos, :suites, :banheiros, :vagas_garagem, :metragem, :ano_construcao,
      :unidades_por_andar, :numero_torres, :andares, :elevadores, :varandas, :posicao_solar,
      :valor, :valor_condominio, :valor_iptu,
      photos: [],
      # Para a nossa relação Muitos-para-Muitos, permitimos um array de IDs de características.
      caracteristica_ids: [],
      endereco_attributes: [:id, :logradouro, :numero, :complemento, :bairro, :cidade, :estado, :cep]
    )
  end
end