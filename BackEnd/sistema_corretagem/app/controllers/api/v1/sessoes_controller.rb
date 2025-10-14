# app/controllers/sessoes_controller.rb
class Api::V1::SessoesController < ApplicationController
  # Pulamos a verificação de autorização apenas para a ação de 'create' (login)
  skip_before_action :authorized, only: [:create, :refresh]

  def create
    # Garantimos presença de parâmetros com tratamento elegante de erros
    usuario_params = params.require(:usuario).permit(:login, :password)
    login = usuario_params[:login].presence
    senha_param = usuario_params[:password].presence

    unless login && senha_param
      return render json: { error: 'Parâmetros de login ausentes' }, status: :bad_request
    end

    user = Usuario.find_by(login: login)

    if user && user.ativo? && user.authenticate(senha_param)
      # Gera o token com o ID do usuário
      token = encode_token({ user_id: user.id })

      # Criar refresh token (token puro + hash armazenado)
      device_id = request.headers['X-Device-Id']
      ua = request.user_agent
      ip = request.remote_ip
      fingerprint = device_id.presence || Digest::SHA256.hexdigest("#{ua}|#{ip}")

      refresh_plain = SecureRandom.hex(32)
      pepper = ENV['REFRESH_TOKEN_PEPPER'].to_s
      token_hash = Digest::SHA256.hexdigest("#{refresh_plain}#{pepper}")
      ttl_days = (ENV['REFRESH_TOKEN_TTL_DAYS'] || '30').to_i

      RefreshToken.create!(
        usuario: user,
        token_hash: token_hash,
        device_fingerprint: fingerprint,
        expires_at: ttl_days.days.from_now
      )

      # Set cookie HttpOnly
      cookie_domain = ENV['COOKIE_DOMAIN']
      cookie_domain = cookie_domain.presence
      cookie_secure = ENV['COOKIE_SECURE'] == 'true'
      cookie_samesite_env = (ENV['COOKIE_SAMESITE'] || 'lax').to_s.downcase
      cookie_samesite = %w[lax strict none].include?(cookie_samesite_env) ? cookie_samesite_env.to_sym : :lax
      cookies[:refresh_token] = {
        value: refresh_plain,
        httponly: true,
        secure: cookie_secure,
        same_site: cookie_samesite,
        domain: cookie_domain,
        expires: ttl_days.days.from_now
      }

      # Auditoria: login bem-sucedido
      AuditTrail.log(
        user: user,
        action: 'login_success',
        severity: 'info',
        correlation_id: request.request_id,
        ip: request.remote_ip,
        user_agent: request.user_agent,
        details: { device_fingerprint: fingerprint }
      )

      # Retorna o token e dados essenciais do usuário
      render json: { user: { id: user.id, nome: user.nome, role: user.role }, token: token }, status: :ok
    else
      # Auditoria: login falho
      # Incrementa contadores por IP e por email (janela de 10 minutos)
      begin
        ip_key = "auth:failed:ip:#{request.remote_ip}"
        email_key = "auth:failed:email:#{login}"
        ip_count = (Rails.cache.read(ip_key) || 0).to_i + 1
        email_count = (Rails.cache.read(email_key) || 0).to_i + 1
        Rails.cache.write(ip_key, ip_count, expires_in: 10.minutes)
        Rails.cache.write(email_key, email_count, expires_in: 10.minutes)
      rescue => e
        Rails.logger.warn("[AuthCounters] Falha ao atualizar contadores: #{e.message}")
      end
      AuditTrail.log(
        user: user,
        action: 'login_failed',
        severity: login_failed_critical?(login, request.remote_ip) ? 'critical' : 'warning',
        correlation_id: request.request_id,
        ip: request.remote_ip,
        user_agent: request.user_agent,
        details: { login: login }
      )
      render json: { error: 'Login ou senha inválidos' }, status: :unauthorized
    end
  end

  # POST /api/v1/auth/refresh
  def refresh
    refresh_plain = cookies[:refresh_token]
    unless refresh_plain
      AuditTrail.log(
        user: current_user,
        action: 'refresh_missing_cookie',
        severity: 'warning',
        correlation_id: request.request_id,
        ip: request.remote_ip,
        user_agent: request.user_agent
      )
      return render json: { error: 'Refresh ausente' }, status: :unauthorized
    end

    device_id = request.headers['X-Device-Id']
    ua = request.user_agent
    ip = request.remote_ip
    fingerprint = device_id.presence || Digest::SHA256.hexdigest("#{ua}|#{ip}")

    pepper = ENV['REFRESH_TOKEN_PEPPER'].to_s
    token_hash = Digest::SHA256.hexdigest("#{refresh_plain}#{pepper}")

    rt = RefreshToken.active.find_by(token_hash: token_hash, device_fingerprint: fingerprint)
    unless rt
      AuditTrail.log(
        user: current_user,
        action: 'refresh_invalid',
        severity: 'critical',
        correlation_id: request.request_id,
        ip: request.remote_ip,
        user_agent: request.user_agent,
        details: { fingerprint: fingerprint }
      )
      return render json: { error: 'Refresh inválido ou expirado' }, status: :unauthorized
    end

    user = rt.usuario

    # Rotação: revoga atual e cria novo
    rt.update!(revoked_at: Time.current)

    new_plain = SecureRandom.hex(32)
    new_hash = Digest::SHA256.hexdigest("#{new_plain}#{pepper}")
    ttl_days = (ENV['REFRESH_TOKEN_TTL_DAYS'] || '30').to_i
    RefreshToken.create!(
      usuario: user,
      token_hash: new_hash,
      device_fingerprint: fingerprint,
      expires_at: ttl_days.days.from_now
    )

    # Set novo cookie
    cookie_domain = ENV['COOKIE_DOMAIN']
    cookie_domain = cookie_domain.presence
    cookie_secure = ENV['COOKIE_SECURE'] == 'true'
    cookie_samesite_env = (ENV['COOKIE_SAMESITE'] || 'lax').to_s.downcase
    cookie_samesite = %w[lax strict none].include?(cookie_samesite_env) ? cookie_samesite_env.to_sym : :lax
    cookies[:refresh_token] = {
      value: new_plain,
      httponly: true,
      secure: cookie_secure,
      same_site: cookie_samesite,
      domain: cookie_domain,
      expires: ttl_days.days.from_now
    }

    # Novo access token
    token = encode_token({ user_id: user.id })

    AuditTrail.log(
      user: user,
      action: 'refresh_success',
      severity: 'info',
      correlation_id: request.request_id,
      ip: request.remote_ip,
      user_agent: request.user_agent,
      details: { device_fingerprint: fingerprint }
    )

    render json: { token: token }, status: :ok
  end

  def logout
    authorize current_user, :logout?

    device_id = request.headers['X-Device-Id']
    ua = request.user_agent
    ip = request.remote_ip
    fingerprint = device_id.presence || Digest::SHA256.hexdigest("#{ua}|#{ip}")

    refresh_plain = cookies[:refresh_token]
    if refresh_plain
      pepper = ENV['REFRESH_TOKEN_PEPPER'].to_s
      token_hash = Digest::SHA256.hexdigest("#{refresh_plain}#{pepper}")
      rt = RefreshToken.find_by(token_hash: token_hash, device_fingerprint: fingerprint)
      rt&.update!(revoked_at: Time.current)
    end
    cookies.delete(:refresh_token, domain: ENV['COOKIE_DOMAIN'].presence)

    AuditTrail.log(
      user: current_user,
      action: 'logout_success',
      severity: 'info',
      correlation_id: request.request_id,
      ip: request.remote_ip,
      user_agent: request.user_agent,
      details: { device_fingerprint: fingerprint }
    )

    render json: { message: 'Logout realizado' }, status: :ok
  end

  def logout_all
    authorize current_user, :logout_all?

    revoked_count = RefreshToken.where(usuario_id: current_user.id).update_all(revoked_at: Time.current)
    cookies.delete(:refresh_token, domain: ENV['COOKIE_DOMAIN'].presence)

    AuditTrail.log(
      user: current_user,
      action: 'logout_all_success',
      severity: 'warning',
      correlation_id: request.request_id,
      ip: request.remote_ip,
      user_agent: request.user_agent,
      details: { revoked_count: revoked_count }
    )

    render json: { message: 'Logout em todos os dispositivos realizado' }, status: :ok
  end
end

# --- Helpers internos ---
private
def login_failed_critical?(email, ip)
  begin
    per_ip = Rails.cache.fetch("auth:failed:ip:#{ip}", expires_in: 10.minutes) { 0 }
    per_email = Rails.cache.fetch("auth:failed:email:#{email}", expires_in: 10.minutes) { 0 }
    # Notar: contadores devem ser incrementados originalmente no fluxo de falha; se indisponível, tratamos como baseline.
    threshold = 5
    (per_ip.to_i >= threshold) || (per_email.to_i >= threshold)
  rescue
    false
  end
end