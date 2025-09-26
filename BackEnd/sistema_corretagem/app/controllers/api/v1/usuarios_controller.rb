# app/controllers/api/v1/usuarios_controller.rb
class Api::V1::UsuariosController < ApplicationController
  # Ação 'create' é pulada para permitir a criação do primeiro admin sem login.
  skip_before_action :authorized, only: [:create]
  # Todas as outras ações exigem autorização de admin.
  before_action :authenticate_admin!, except: [:create]
  before_action :set_usuario, only: [:show, :update, :destroy]

  # GET /api/v1/usuarios
  def index
    @usuarios = Usuario.all
    render json: @usuarios, each_serializer: UsuarioSerializer
  end

  # GET /api/v1/usuarios/:id
  def show
    render json: @usuario, serializer: UsuarioSerializer
  end

  # POST /api/v1/usuarios
  def create
    @usuario = Usuario.new(usuario_params)

    # Lógica segura para o primeiro usuário e definição de 'role'.
    # Apenas um admin logado pode definir o 'role' de um novo usuário.
    # Se ninguém estiver logado, assume-se que é o primeiro usuário (admin).
    if current_user&.admin?
      @usuario.role = usuario_params[:role] || :corretor
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
    if @usuario.update(usuario_params)
      render json: @usuario, serializer: UsuarioSerializer
    else
      render json: @usuario.errors, status: :unprocessable_entity
    end
  end
  
  # DELETE /api/v1/usuarios/:id (Inativação)
  def destroy
    # Um admin não pode inativar a si mesmo
    if @usuario == current_user
      render json: { error: 'Você não pode inativar sua própria conta.' }, status: :forbidden
      return
    end

    if @usuario.update(ativo: false)
      head :no_content 
    else
      render json: @usuario.errors, status: :unprocessable_entity
    end
  end 

  private

  def set_usuario
    @usuario = Usuario.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Usuário não encontrado." }, status: :not_found
  end

  def authenticate_admin!
    render json: { error: 'Acesso não autorizado. Apenas administradores.' }, status: :unauthorized unless current_user&.admin?
  end

  def usuario_params
    # Lista de parâmetros completa e segura
    params.require(:usuario).permit(
      :nome, :email, :login, :password, :cpf, :ativo, :role, 
      endereco_attributes: [
        :id, :logradouro, :numero, :complemento, :bairro, :cidade, :estado, :cep
      ],
      perfil_corretor_attributes: [:id, :creci, :creci_estado]
    )
  end
end