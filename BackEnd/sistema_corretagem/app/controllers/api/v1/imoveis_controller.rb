# app/controllers/api/v1/imoveis_controller.rb
class Api::V1::ImoveisController < ApplicationController
  before_action :authorized
  before_action :set_imovel, only: [:show, :update, :destroy]

  # GET /api/v1/imoveis (com filtros dinâmicos)
  def index
    base_imoveis = policy_scope(Imovel)
    imoveis_filtrados = base_imoveis.includes(:endereco, :caracteristicas)
                                    .por_bairro(params[:bairro])
                                    .com_valor_minimo(params[:valor_minimo])
                                    .com_valor_maximo(params[:valor_maximo])
                                    .com_quartos_minimo(params[:quartos_minimo])
                                    .com_tipo(params[:tipo])

    @pagy, @imoveis = pagy(imoveis_filtrados, limit: per_page_limit)
    pagy_headers_merge(@pagy)

    render json: @imoveis, each_serializer: ImovelSerializer
  end

  # GET /api/v1/imoveis/:id
  def show
    authorize @imovel
    render json: @imovel, serializer: ImovelSerializer
  end

  # POST /api/v1/imoveis
  def create
    Rails.logger.info("[ImoveisController#create] Content-Type=#{request.headers['Content-Type']} Accept=#{request.headers['Accept']}")
    Rails.logger.info("[ImoveisController#create] Raw body=#{request.raw_post}")

    begin
      attrs = imovel_params
    rescue ActionController::ParameterMissing => e
      Rails.logger.error("[ImoveisController#create] ParameterMissing: #{e.param} | params=#{params.to_unsafe_h}")
      return render json: { error: "Parâmetro obrigatório ausente ou inválido", param: e.param, params: params.to_unsafe_h }, status: :bad_request
    end

    @imovel = current_user.imoveis.build(attrs)
    authorize @imovel

    if @imovel.save
      render json: @imovel, status: :created, serializer: ImovelSerializer
    else
      Rails.logger.warn("[ImoveisController#create] Validation errors: #{@imovel.errors.full_messages}")
      render json: @imovel.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/imoveis/:id
  def update
    authorize @imovel

    # Atualiza os demais atributos sem incluir 'photos' e sem incluir 'remove_photo_ids'
    attrs = imovel_params.except(:photos, :remove_photo_ids)

    if @imovel.update(attrs)
      # Anexar novas fotos SEM substituir as existentes
      uploaded_photos = params[:imovel] && params[:imovel][:photos]
      Rails.logger.info("[ImoveisController#update] uploaded_photos count=#{Array(uploaded_photos).size}") if uploaded_photos.present?

      begin
        if uploaded_photos.present?
          Array(uploaded_photos).each { |file| @imovel.photos.attach(file) }
        end
      rescue => e
        Rails.logger.error("[ImoveisController#update] Falha ao anexar fotos: #{e.class} - #{e.message}")
        # Política: em caso de erro de upload, não remover nenhuma foto existente
        return render json: { error: "Falha ao anexar novas fotos", details: e.message }, status: :unprocessable_entity
      end

      # Remoção seletiva de fotos somente após anexos bem sucedidos
      if params[:imovel] && params[:imovel][:remove_photo_ids].present?
        ids = Array(params[:imovel][:remove_photo_ids]).map(&:to_s)
        Rails.logger.info("[ImoveisController#update] remove_photo_ids count=#{ids.size}")
        ActiveRecord::Base.transaction do
          @imovel.photos.each do |photo|
            photo.purge if ids.include?(photo.id.to_s)
          end
        end
      end

      render json: @imovel, serializer: ImovelSerializer
    else
      render json: @imovel.errors, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/imoveis/:id
  def destroy
    authorize @imovel
    @imovel.destroy
    head :no_content
  end

  # GET /api/v1/imoveis/buscar
  def buscar
    perfil = PerfilBusca.find(params[:perfil_busca_id])

    imoveis = policy_scope(Imovel)
                .includes(:endereco, :comodo)
                .where(status: :disponivel)

    # Finalidade e condição (enums compatíveis com Imovel)
    imoveis = imoveis.where(finalidade: perfil.finalidade) if perfil.finalidade.present?
    imoveis = imoveis.where(condicao: perfil.condicao) if perfil.condicao.present?

    # Bairros preferenciais (array YAML serializado)
    if perfil.bairro_preferencia.present?
      imoveis = imoveis.por_bairro(perfil.bairro_preferencia)
    end

    # Faixa de valor
    imoveis = imoveis.where("valor <= ?", perfil.valor_maximo_imovel) if perfil.valor_maximo_imovel.present?

    # Requisitos mínimos
    imoveis = imoveis.where("quartos >= ?", perfil.quartos_minimo) if perfil.quartos_minimo.present?
    imoveis = imoveis.where("suites >= ?", perfil.suites_minimo) if perfil.suites_minimo.present?
    imoveis = imoveis.where("vagas_garagem >= ?", perfil.vagas_minimo) if perfil.vagas_minimo.present?
    imoveis = imoveis.where("metragem >= ?", perfil.metragem_minima) if perfil.metragem_minima.present?

    # Exige varanda: considera comodo.varanda ou número de varandas no próprio imóvel
    if perfil.exige_varanda
      imoveis = imoveis.left_outer_joins(:comodo)
                       .where("comodos.varanda = TRUE OR imoveis.varandas > 0")
    end

    # Paginação e headers (consistência com index)
    @pagy, @imoveis = pagy(imoveis, limit: per_page_limit)
    pagy_headers_merge(@pagy)
    render json: @imoveis, each_serializer: ImovelSerializer
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Perfil de busca não encontrado." }, status: :not_found
  end

  private

  def set_imovel
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
      caracteristica_ids: [],
      endereco_attributes: [:id, :logradouro, :numero, :complemento, :bairro, :cidade, :estado, :cep],
      comodo_attributes: [
        :id,
        :area_de_servico,
        :cozinha,
        :sala_de_estar,
        :sala_de_jantar,
        :suite,
        :varanda,
        :wc_social,
        :wc_de_servico,
        :despensa,
        :quarto_de_servico,
        :sala_de_visita,
        :banheiro_social,
        :lavabo,
        :escritorio,
        :home_office,
        :closet,
        :hall,
        :sala_de_tv,
        :terraco
      ],
      infraestrutura_attributes: [
        :id,
        :garagem,
        :lavanderia,
        :jardim_interno,
        :jardim_externo,
        :piscina,
        :playground,
        :portaria_24h,
        :salao_de_festas,
        :sistema_de_seguranca,
        :churrasqueira,
        :elevador,
        :sauna,
        :quadra_poliesportiva,
        :academia,
        :campo_de_futebol,
        :bicicletario,
        :area_de_lazer,
        :central_de_gas,
        :portao_eletronico,
        :gerador,
        :interfone,
        :guarita,
        :monitoramento,
        :cftv,
        :brinquedoteca,
        :salao_de_jogos,
        :spa,
        :coworking,
        :pet_place,
        :car_wash,
        :mini_mercado,
        :estacionamento_visitantes
      ],
      piso_attributes: [
        :id,
        :porcelanato,
        :ceramica,
        :granito,
        :laminado,
        :madeira,
        :vinilico,
        :carpete,
        :ardosia,
        :marmore,
        :taco
      ],
      posicao_attributes: [
        :id,
        :nascente,
        :vista_para_o_mar,
        :beira_mar,
        :poente,
        :frente_para_o_mar,
        :norte,
        :sul,
        :leste,
        :oeste
      ],
      proximidade_attributes: [
        :id,
        :bares_e_restaurantes,
        :escola,
        :faculdade,
        :farmacia,
        :hospital,
        :padaria,
        :pet_shop,
        :shopping_center,
        :supermercado,
        :banco,
        :shopping,
        :praia,
        :parque,
        :metrô,
        :terminal_de_onibus
      ]
    )
  end
end