# app/controllers/api/v1/usuarios_controller.rb
class Api::V1::UsuariosController < ApplicationController
  # 'create' é a única ação que pode ser acessada por um usuário não logado.
  skip_before_action :authorized, only: [:create]
  
  # REMOVEMOS o 'before_action :authenticate_admin!', pois o Pundit cuidará disso.
  before_action :set_usuario, only: [:show, :update, :deactivate]

  # GET /api/v1/usuarios
  def index
    # Pundit usa a 'Scope' da UsuarioPolicy para garantir que apenas admins acessem a lista.
    @usuarios = policy_scope(Usuario)
    
    # Paginação via concern: usa per_page_limit para definir o limite por página.
    @pagy, @usuarios = pagy(@usuarios.order(nome: :asc), limit: per_page_limit)
    pagy_headers_merge(@pagy)
    
    render json: @usuarios, each_serializer: UsuarioSerializer
  end

  # GET /api/v1/usuarios/:id
  def show
    # Pundit verifica a regra 'show?' na policy.
    # Permite que um admin veja qualquer um, ou que um usuário veja a si mesmo.
    authorize @usuario
    render json: @usuario, serializer: UsuarioSerializer
  end

  # POST /api/v1/usuarios
  def create
    @usuario = Usuario.new(usuario_params)
    authorize @usuario

    # A lógica de negócio para definir o 'role' continua aqui, pois é uma regra de
    # COMO o usuário é criado, não se ele PODE ser criado.
    if current_user&.admin?
      @usuario.role = params.dig(:usuario, :role) || :corretor
    else
      @usuario.role = Usuario.count == 0 ? :admin : :corretor
    end

    if @usuario.save
      AuditTrail.log(
        user: current_user,
        action: 'usuario_create',
        severity: 'info',
        correlation_id: request.request_id,
        ip: request.remote_ip,
        user_agent: request.user_agent,
        entity: @usuario,
        new_value: @usuario.attributes
      )
      render json: @usuario, status: :created, serializer: UsuarioSerializer
    else
      AuditTrail.log(
        user: current_user,
        action: 'usuario_create_failed',
        severity: 'warning',
        correlation_id: request.request_id,
        ip: request.remote_ip,
        user_agent: request.user_agent,
        details: { errors: @usuario.errors.full_messages }
      )
      render json: @usuario.errors, status: :unprocessable_entity
    end
  end

  def update
    authorize @usuario

    Rails.logger.info("[UsuariosController#update] RAW params: #{params.to_unsafe_h.inspect}")
    permitted_attrs = usuario_params
    Rails.logger.info("[UsuariosController#update] Permitted attrs: #{permitted_attrs.to_h.inspect}")

    old_attrs = @usuario.attributes
    if @usuario.update(permitted_attrs)
      AuditTrail.log(
        user: current_user,
        action: 'usuario_update',
        severity: 'info',
        correlation_id: request.request_id,
        ip: request.remote_ip,
        user_agent: request.user_agent,
        entity: @usuario,
        old_value: old_attrs,
        new_value: @usuario.attributes
      )
      Rails.logger.info("[UsuariosController#update] Update sucesso para usuário ##{@usuario.id}")
      render json: @usuario, serializer: UsuarioSerializer
    else
      AuditTrail.log(
        user: current_user,
        action: 'usuario_update_failed',
        severity: 'warning',
        correlation_id: request.request_id,
        ip: request.remote_ip,
        user_agent: request.user_agent,
        entity: @usuario,
        details: { errors: @usuario.errors.full_messages }
      )
      Rails.logger.warn("[UsuariosController#update] Falha no update: #{@usuario.errors.full_messages.inspect}")
      render json: @usuario.errors, status: :unprocessable_entity
    end
  end
  
  def deactivate 
    authorize @usuario
    old_attrs = @usuario.attributes
    if @usuario.update(ativo: false)
      AuditTrail.log(
        user: current_user,
        action: 'usuario_deactivate',
        severity: 'warning',
        correlation_id: request.request_id,
        ip: request.remote_ip,
        user_agent: request.user_agent,
        entity: @usuario,
        old_value: old_attrs,
        new_value: @usuario.attributes
      )
      head :no_content 
    else
      AuditTrail.log(
        user: current_user,
        action: 'usuario_deactivate_failed',
        severity: 'warning',
        correlation_id: request.request_id,
        ip: request.remote_ip,
        user_agent: request.user_agent,
        entity: @usuario,
        details: { errors: @usuario.errors.full_messages }
      )
      render json: @usuario.errors, status: :unprocessable_entity
    end
  end 

  private

  def set_usuario
    # O método fica simples, apenas encontra o registro.
    @usuario = Usuario.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Usuário não encontrado." }, status: :not_found
  end

  # O método de parâmetros fortes continua exatamente os mesmos.
  def usuario_params
    if current_user&.admin?
      admin_usuario_params
    else
      public_usuario_params
    end
  end

  def public_usuario_params
    params.require(:usuario).permit(
      :nome, :email, :login, :password, :cpf,
      endereco_attributes: [:id, :logradouro, :numero, :complemento, :bairro, :cidade, :estado, :cep],
      perfil_corretor_attributes: [:id, :creci, :creci_estado]
    )
  end

  def admin_usuario_params
    params.require(:usuario).permit(
      :nome, :email, :login, :password, :cpf, :ativo, :role,
      endereco_attributes: [:id, :logradouro, :numero, :complemento, :bairro, :cidade, :estado, :cep],
      perfil_corretor_attributes: [:id, :creci, :creci_estado]
    )
  end
end