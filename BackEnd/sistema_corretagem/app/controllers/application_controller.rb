require 'jwt'
# app/controllers/application_controller.rb
class ApplicationController < ActionController::API
  # --- INCLUSÃO DOS MÓDULOS ---
  # Inclui os métodos de backend do Pagy para paginação.
  include Pagy::Backend
  # Inclui os métodos de autorização do Pundit (policy_scope, authorize).
  include Pundit::Authorization
  include ActiveStorage::SetCurrent
  include PaginationConcern
  # Habilita cookies em controllers API-only (ActionDispatch::Cookies já está no middleware)
  include ActionController::Cookies

  # Trata exceções de autorização (Pundit) e parâmetros ausentes (ParameterMissing)
  rescue_from Pundit::NotAuthorizedError do |e|
    Rails.logger.warn("[Authorization] NotAuthorized: query=#{e.query} record=#{e.record.class.name} id=#{e.record.try(:id)} user_id=#{current_user&.id}")
    # LGPD/GDPR: registrar negações de acesso com metadados mínimos e sem dados sensíveis
    AuditTrail.log(
      user: current_user,
      action: 'authorization_denied',
      entity: e.record,
      severity: 'warning',
      correlation_id: request.request_id,
      ip: request.remote_ip,
      user_agent: request.user_agent,
      details: { policy_query: e.query }
    )
    render json: { error: "Acesso negado", details: { policy_query: e.query, record: e.record.class.name } }, status: :forbidden
  end

  rescue_from ActionController::ParameterMissing do |e|
    Rails.logger.error("[BadRequest] ParameterMissing: #{e.param} | params=#{params.to_unsafe_h.inspect}")
    render json: { error: "Parâmetro obrigatório ausente ou inválido", param: e.param }, status: :bad_request
  end

  # Trata violação de unicidade para evitar 500 (ex.: UNIQUE index)
  rescue_from ActiveRecord::RecordNotUnique do |e|
    Rails.logger.error("[UnprocessableEntity] RecordNotUnique: #{e.message} | params=#{params.to_unsafe_h.inspect}")
    render json: { error: "Registro duplicado", details: e.message }, status: :unprocessable_entity
  end

  # Trata ArgumentError gerado por enums inválidos para evitar 500
  rescue_from ArgumentError do |e|
    if e.message =~ /is not a valid/ || e.message =~ /invalid enum/ || e.message =~ /status is not a valid/
      Rails.logger.error("[UnprocessableEntity] Invalid enum: #{e.message} | params=#{params.to_unsafe_h.inspect}")
      render json: { error: "Valor inválido para campo enumerado", details: e.message }, status: :unprocessable_entity
    else
      raise e
    end
  end

  # --- CALLBACKS ---
  # Este método será chamado antes de qualquer ação que precise de autenticação.
  before_action :authorized
  # Define as opções padrão de URL (host/protocolo/porta) para geração de URLs (ex.: url_for em serializers)
  before_action :set_default_url_options
  before_action :set_active_storage_url_options

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

  # Pega o token do cabeçalho da requisição (ex: 'Bearer <token)'
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

  def set_active_storage_url_options
    ActiveStorage::Current.url_options = {
      host: request.host,
      protocol: request.protocol.delete('://'),
      port: request.port
    }
  end
end