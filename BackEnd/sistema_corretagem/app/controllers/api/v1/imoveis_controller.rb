# app/controllers/api/v1/imoveis_controller.rb
class Api::V1::ImoveisController < ApplicationController
  before_action :authorized
  before_action :set_imovel, only: [:show, :update, :destroy]

  # GET /api/v1/imoveis (com filtros dinâmicos)
  def index
    # Começamos com uma base de imóveis (todos se for admin, só os do corretor se não for)
    base_imoveis = current_user.admin? ? Imovel.all : current_user.imoveis
    
    # Aplicamos os filtros que planejamos anteriormente
    @imoveis = base_imoveis.por_bairro(params[:bairro])
                           .com_valor_minimo(params[:valor_minimo])
                           .com_valor_maximo(params[:valor_maximo])
                           .com_quartos_minimo(params[:quartos_minimo])
                           .com_tipo(params[:tipo])

    render json: @imoveis, each_serializer: ImovelSerializer
  end

  # GET /api/v1/imoveis/:id
  def show
    render json: @imovel, serializer: ImovelSerializer
  end

  # POST /api/v1/imoveis
  def create
    @imovel = current_user.imoveis.build(imovel_params)

    if @imovel.save
      # Usando o serializer na criação
      render json: @imovel, status: :created, serializer: ImovelSerializer
    else
      render json: @imovel.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/imoveis/:id
  def update
    if @imovel.update(imovel_params)
      # Usando o serializer na atualização
      render json: @imovel, serializer: ImovelSerializer
    else
      render json: @imovel.errors, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/imoveis/:id
  def destroy
    @imovel.destroy
    head :no_content
  end

  # GET /api/v1/imoveis/buscar
  def buscar
    perfil = PerfilBusca.find(params[:perfil_busca_id])
    
    # A lógica da busca também pode ser refatorada com scopes no futuro
    @imoveis = Imovel.where(status: :disponivel)
                   .where("valor <= ?", perfil.valor_maximo_imovel) if perfil.valor_maximo_imovel.present?
    # ... outros filtros ...

    # Usando o serializer na busca
    render json: @imoveis, each_serializer: ImovelSerializer
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Perfil de busca não encontrado." }, status: :not_found
  end

  private

  def set_imovel
    # Lógica de autorização melhorada:
    # Se o usuário for admin, ele pode encontrar qualquer imóvel.
    # Se for corretor, só pode encontrar os seus.
    if current_user.admin?
      @imovel = Imovel.find(params[:id])
    else
      @imovel = current_user.imoveis.find(params[:id])
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Imóvel não encontrado ou você não tem permissão." }, status: :not_found
  end

  def imovel_params
    params.require(:imovel).permit(
      :nome_empreendimento, :tipo, :finalidade, :condicao, :descricao, :status,
      :quartos, :suites, :banheiros, :vagas_garagem, :metragem, :ano_construcao,
      :unidades_por_andar, :numero_torres, :andares, :elevadores, :varandas,
      :valor, :valor_condominio, :valor_iptu,
      comodidades: [],
      photos: [],      
      endereco_attributes: [:id, :logradouro, :numero, :complemento, :bairro, :cidade, :estado, :cep]
    )
  end
end