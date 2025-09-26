# app/controllers/sessoes_controller.rb
class Api::V1::SessoesController < ApplicationController
  # Pulamos a verificação de autorização apenas para a ação de 'create' (login)
  skip_before_action :authorized, only: [:create]

  def create
    user = Usuario.find_by(login: params[:usuario][:login])

    if user && user.authenticate(params[:usuario][:senha])
      # Gera o token com o ID do usuário
      token = encode_token({ user_id: user.id })
      # Retorna o token e os dados do usuário
      render json: { user: { id: user.id, nome: user.nome, role: user.role }, token: token }, status: :ok
    else
      render json: { error: 'Login ou senha inválidos' }, status: :unauthorized
    end
  end
end