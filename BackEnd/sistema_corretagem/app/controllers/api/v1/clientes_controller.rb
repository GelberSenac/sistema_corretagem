# app/controllers/api/v1/clientes_controller.rb
class Api::V1::ClientesController < ApplicationController
  before_action :authorized
  before_action :set_cliente, only: [:show, :update, :destroy]

  # GET /api/v1/clientes
  def index
    # Lógica de autorização: admin vê todos, corretor vê apenas os seus.
    if current_user.admin?
      @clientes = Cliente.all
    else
      @clientes = current_user.clientes
    end
    render json: @clientes, each_serializer: ClienteSerializer
  end

  # GET /api/v1/clientes/:id
  def show
    render json: @cliente, serializer: ClienteSerializer
  end

  # POST /api/v1/clientes
  def create
    # O novo cliente é sempre associado ao corretor que está logado
    @cliente = current_user.clientes.build(cliente_params)

    if @cliente.save
      render json: @cliente, status: :created, serializer: ClienteSerializer
    else
      render json: @cliente.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/clientes/:id
  def update
    if @cliente.update(cliente_params)
      render json: @cliente, serializer: ClienteSerializer
    else
      render json: @cliente.errors, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/clientes/:id
  def destroy
    @cliente.destroy
    head :no_content
  end

  private

  def set_cliente
    # Lógica de autorização melhorada: admin pode encontrar qualquer cliente.
    if current_user.admin?
      @cliente = Cliente.find(params[:id])
    else
      @cliente = current_user.clientes.find(params[:id])
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Cliente não encontrado ou você não tem permissão." }, status: :not_found
  end

  def cliente_params
    # Lista de parâmetros completa, refletindo todas as migrations que fizemos.
    params.require(:cliente).permit(
      :nome, :rg, :cpf, :sexo, :email, :telefone, :data_nascimento,
      :estado_civil, :profissao, :renda, :nacionalidade,
      :data_casamento, :regime_bens,
      conjuge_attributes: [
        :id, :nome, :data_nascimento, :cpf, :rg, :profissao, :renda, 
        :email, :celular, :nacionalidade, :data_casamento, :regime_bens
      ],
      endereco_attributes: [
        :id, :logradouro, :numero, :complemento, :bairro, :cidade, 
        :estado, :cep
      ]
    )
  end
end