class UsuariosController < ApplicationController
  # Filtro para verificar se o usuário é admin antes de criar/atualizar/inativar
  before_action :authenticate_admin!, only: [:create, :update, :destroy]

  def index
    usuarios = Usuario.all
    render json: usuarios
  end

  def show
    usuario = Usuario.find(params[:id])
    render json: usuario
  end

  def create
    usuario = Usuario.new(usuario_params)

    # Garante que o primeiro usuário do sistema seja um admin
    usuario.role = Usuario.count == 0 ? :admin : params[:usuario][:role]

    if usuario.save
      render json: usuario, status: :created
    else
      render json: usuario.errors, status: :unprocessable_entity
    end
  end

  def update
    usuario = Usuario.find(params[:id])
    if usuario.update(usuario_params)
      render json: usuario
    else
      render json: usuario.errors, status: :unprocessable_entity
    end
  end
  
  def destroy
    usuario = Usuario.find(params[:id])
    if usuario.update(ativo: false)
      head :no_content 
    else
      render json: usuario.errors, status: :unprocessable_entity
    end
  end 

  private

  # Novo filtro que autentica o admin
  def authenticate_admin!
    # Lógica simples para autenticar se o usuário atual é admin
    # Esta lógica precisará ser implementada futuramente após a autenticação
    # por token ou sessão, mas por enquanto, podemos pular
    # return head :unauthorized unless current_user&.admin?
  end

  def usuario_params
    # Permite 'password' e os atributos aninhados de 'endereco'
    params.require(:usuario).permit(:nome, :email, :login, :password, :cpf, :ativo, :role, endereco_attributes: [:id, :logradouro, :numero, :complemento, :bairro, :cidade, :estado, :cep])
  end
end