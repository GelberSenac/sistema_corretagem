# app/controllers/api/v1/clientes_controller.rb
class Api::V1::ClientesController < ApplicationController
  before_action :authorized
  before_action :set_cliente, only: [:show, :update, :destroy]

  # GET /api/v1/clientes
  def index
    # Pundit usa a 'Scope' da nossa policy para filtrar a coleção automaticamente.
    # Esta linha substitui todo o 'if/else' de autorização que existia antes.
    @clientes = policy_scope(Cliente)

    # A lógica de paginação e includes que já fizemos continua igual.
    @pagy, @clientes = pagy(@clientes.includes(:endereco, :conjuge))
    pagy_headers_merge(@pagy)
    
    render json: @clientes, each_serializer: ClienteSerializer
  end

  # GET /api/v1/clientes/:id
  def show
    # Pundit verifica se o 'current_user' tem permissão para a ação 'show?'
    # na policy, passando o @cliente como o 'record'.
    # Se a policy retornar 'false', ele automaticamente gera um erro de não autorizado.
    authorize @cliente
    
    render json: @cliente, serializer: ClienteSerializer
  end

  # POST /api/v1/clientes
  def create
    @cliente = current_user.clientes.build(cliente_params)
    
    # Verifica se o usuário tem permissão para criar clientes.
    authorize @cliente

    if @cliente.save
      render json: @cliente, status: :created, serializer: ClienteSerializer
    else
      render json: @cliente.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/clientes/:id
  def update
    authorize @cliente

    # Logs de depuração para entender os parâmetros recebidos e os permitidos
    Rails.logger.info("[ClientesController#update] RAW params: #{params.to_unsafe_h.inspect}")
    permitted_attrs = cliente_params
    Rails.logger.info("[ClientesController#update] Permitted attrs: #{permitted_attrs.to_h.inspect}")
    
    if @cliente.update(permitted_attrs)
      Rails.logger.info("[ClientesController#update] Update sucesso para cliente ##{@cliente.id}")
      render json: @cliente, serializer: ClienteSerializer
    else
      Rails.logger.warn("[ClientesController#update] Falha no update: #{@cliente.errors.full_messages.inspect}")
      render json: @cliente.errors, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/clientes/:id
  def destroy
    authorize @cliente
    
    @cliente.destroy
    head :no_content
  end

  private

  def set_cliente
    # O método 'set_cliente' agora fica muito mais simples.
    # Ele só precisa encontrar o cliente. A autorização de quem pode
    # ou não acessá-lo é feita pelo 'authorize @cliente' em cada ação.
    @cliente = Cliente.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Cliente não encontrado." }, status: :not_found
  end

  # O método de parâmetros fortes continua exatamente o mesmo.
  def cliente_params
    params.require(:cliente).permit(
      :nome, :rg, :cpf, :sexo, :email, :telefone, :data_nascimento,
      :estado_civil, :profissao, :renda, :nacionalidade,
      :data_casamento, :regime_bens,
      
      conjuge_attributes: [
        :id, :nome, :data_nascimento, :cpf, :rg, :profissao, :renda, 
        :email, :celular, :nacionalidade, :data_casamento, :regime_bens,
        :_destroy
      ],
      
      endereco_attributes: [
        :id, :logradouro, :numero, :complemento, :bairro, :cidade, 
        :estado, :cep,
        :_destroy
      ]
    )
  end
end