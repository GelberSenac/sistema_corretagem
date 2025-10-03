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
    
    # A lógica de paginação que já tínhamos, agora aplicada ao escopo do Pundit.
    @pagy, @usuarios = pagy(@usuarios.order(nome: :asc))
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
    
    # Pundit verifica a regra 'create?'. Permite acesso público ou de admin.
    authorize @usuario

    # A lógica de negócio para definir o 'role' continua aqui, pois é uma regra de
    # COMO o usuário é criado, não se ele PODE ser criado.
    if current_user&.admin?
      @usuario.role = params.dig(:usuario, :role) || :corretor
    else
      @usuario.role = Usuario.count == 0 ? :admin : :corretor
    end

    if @usuario.save
      render json: @usuario, status: :created, serializer: UsuarioSerializer
    else
      render json: @usuario.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/usuarios/:id
  def update
    # Pundit verifica a regra 'update?' na policy.
    authorize @usuario
    
    if @usuario.update(usuario_params)
      render json: @usuario, serializer: UsuarioSerializer
    else
      render json: @usuario.errors, status: :unprocessable_entity
    end
  end
  
  # DELETE /api/v1/usuarios/:id (Inativação)
  def deactivate 
    # Pundit verifica a regra 'deactivate?'.
    # Garante que um admin não pode desativar a si mesmo.
    authorize @usuario
    
    if @usuario.update(ativo: false)
      head :no_content 
    else
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

  # O método 'authenticate_admin!' foi REMOVIDO, pois o Pundit o torna obsoleto.

  # Os métodos de parâmetros fortes continuam exatamente os mesmos.
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
      endereco_attributes: [:logradouro, :numero, :complemento, :bairro, :cidade, :estado, :cep],
      perfil_corretor_attributes: [:creci, :creci_estado]
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