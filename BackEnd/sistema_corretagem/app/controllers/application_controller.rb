# app/controllers/application_controller.rb
class ApplicationController < ActionController::API
  # Este método será chamado antes de qualquer ação que precise de autenticação
  before_action :authorized

  # Codifica os dados do usuário (payload) em um token JWT
  def encode_token(payload)
    # O segredo deve ser armazenado em variáveis de ambiente no futuro
    JWT.encode(payload, 'my_s3cr3t') 
  end

  # Pega o token do cabeçalho da requisição (ex: 'Bearer <token>')
  def auth_header
    request.headers['Authorization']
  end

  # Decodifica o token para obter os dados do usuário
  def decoded_token
    if auth_header
      token = auth_header.split(' ')[1] # Pega apenas o token
      begin
        JWT.decode(token, 'my_s3cr3t', true, algorithm: 'HS256')
      rescue JWT::DecodeError
        nil
      end
    end
  end

  # Encontra o usuário logado com base no token decodificado
  def current_user
    if decoded_token
      user_id = decoded_token[0]['user_id']
      @user = Usuario.find_by(id: user_id)
    end
  end

  # Verifica se existe um usuário logado
  def logged_in?
    !!current_user
  end

  # Bloqueia a ação se o usuário não estiver logado
  def authorized
    render json: { message: 'Por favor, realize o login' }, status: :unauthorized unless logged_in?
  end
end