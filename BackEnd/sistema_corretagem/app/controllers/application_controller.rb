require 'jwt'
# app/controllers/application_controller.rb
class ApplicationController < ActionController::API
  # --- INCLUSÃO DOS MÓDULOS ---
  # Inclui os métodos de backend do Pagy para paginação.
  include Pagy::Backend
  # Inclui os métodos de autorização do Pundit (policy_scope, authorize).
  include Pundit::Authorization

  # --- CALLBACKS ---
  # Este método será chamado antes de qualquer ação que precise de autenticação.
  before_action :authorized
  # Define as opções padrão de URL (host/protocolo/porta) para geração de URLs (ex.: url_for em serializers)
  before_action :set_default_url_options

  # --- LÓGICA DE AUTENTICAÇÃO (JWT) ---

  # Recupera o segredo do JWT de ENV ou credentials, com fallback controlado
  def jwt_secret
    env_secret = ENV["JWT_SECRET"].presence
    creds_secret = Rails.application.credentials.dig(:jwt, :secret)
    if Rails.env.production?
      env_secret || creds_secret || raise("JWT_SECRET não configurado em produção")
    else
      env_secret || creds_secret || "my_s3cr3t"
    end
  end

  # Define o TTL do JWT (em segundos), com padrão por ambiente
  def jwt_ttl_seconds
    (ENV["JWT_TTL_SECONDS"] || (Rails.env.production? ? 900 : 7200)).to_i
  end

  # Codifica os dados do usuário (payload) em um token JWT com expiração
  def encode_token(payload)
    payload = payload.merge({ exp: (Time.now.to_i + jwt_ttl_seconds) })
    JWT.encode(payload, jwt_secret, 'HS256')
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
        JWT.decode(token, jwt_secret, true, algorithm: 'HS256')
      rescue JWT::ExpiredSignature
        nil
      rescue JWT::DecodeError
        nil
      end
    end
  end

  # Encontra o usuário logado com base no token decodificado
  def current_user
    if decoded_token
      user_id = decoded_token[0]['user_id']
      @user ||= Usuario.find_by(id: user_id) # Usamos ||= para evitar buscas repetidas no mesmo request
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

  # Define as opções padrão de URL com base na requisição atual.
  # Isso evita erros ao chamar url_for em serializers (ex.: ImovelSerializer.photos_urls)
  def set_default_url_options
    Rails.application.routes.default_url_options = {
      host: request.host,
      protocol: request.protocol.delete('://'),
      port: request.port
    }
  end
end