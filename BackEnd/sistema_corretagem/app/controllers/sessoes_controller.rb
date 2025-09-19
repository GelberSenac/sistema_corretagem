class SessoesController < ApplicationController
  def create
    user = Usuario.find_by(login: params[:usuario][:login])

    if user && user.authenticate(params[:usuario][:senha])
      render json: { message: 'Login bem-sucedido!' }, status: :ok
    else
      render json: { error: 'Login ou senha inválidos' }, status: :unauthorized
    end
  end  
end
