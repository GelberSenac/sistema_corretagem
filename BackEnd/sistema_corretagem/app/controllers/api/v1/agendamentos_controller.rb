class Api::V1::AgendamentosController < ApplicationController
  before_action :set_agendamento, only: [:show, :update, :destroy]

  # GET /api/v1/agendamentos
  def index
    # Escopo por papel usando Pundit
    agendamentos = policy_scope(Agendamento)

    # Filtros (status, usuario_id, cliente_id)
    if params[:status].present?
      # Enum aceita símbolos/strings; garantimos formato válido
      begin
        agendamentos = agendamentos.where(status: Agendamento.statuses.fetch(params[:status]))
      rescue KeyError
        # Ignora filtro inválido
      end
    end
    if params[:usuario_id].present? && current_user&.role == 'admin'
      agendamentos = agendamentos.where(usuario_id: params[:usuario_id])
    end
    if params[:cliente_id].present?
      agendamentos = agendamentos.where(cliente_id: params[:cliente_id])
    end

    # Paginação (Pagy) e ordenação por início desc com cap de 30
    @pagy, @agendamentos = pagy(agendamentos.order(data_inicio: :desc), limit: per_page_limit)
    pagy_headers_merge(@pagy)

    render json: @agendamentos
  end

  # GET /api/v1/agendamentos/:id
  def show
    authorize @agendamento
    render json: @agendamento
  end

  # POST /api/v1/agendamentos
  def create
    attrs = agendamento_params
    unless current_user&.role == 'admin'
      # Não-admin sempre se tornam donos
      attrs[:usuario_id] = current_user&.id
    end
    @agendamento = Agendamento.new(attrs)
    authorize @agendamento

    if @agendamento.save
      render json: @agendamento, status: :created
    else
      render json: @agendamento.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/agendamentos/:id
  def update
    authorize @agendamento
    attrs = agendamento_params
    unless current_user&.role == 'admin'
      # Blindagem: não permitir troca de usuario_id por não-admin
      attrs.delete(:usuario_id)
    end
    if @agendamento.update(attrs)
      render json: @agendamento
    else
      render json: @agendamento.errors, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/agendamentos/:id
  def destroy
    authorize @agendamento
    @agendamento.destroy
  end

  private

  def set_agendamento
    @agendamento = Agendamento.find(params[:id])
  end

  def agendamento_params
    params.require(:agendamento).permit(:titulo, :descricao, :data_inicio, :data_fim, :local, :status, :usuario_id, :cliente_id, :imovel_id)
  end
end
