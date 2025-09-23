class SessoesController < ApplicationController
  def create
    user = Usuario.find_by(login: params[:usuario][:login])

    if user && user.authenticate(params[:usuario][:senha])
      # Agora a resposta JSON inclui o papel do usuário
      render json: { message: 'Login bem-sucedido!', role: user.role }, status: :ok
    else
      render json: { error: 'Login ou senha inválidos' }, status: :unauthorized
    end
  end
end