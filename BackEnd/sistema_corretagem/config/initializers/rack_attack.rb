# config/initializers/rack_attack.rb

class Rack::Attack
  # Cache store (Rails.cache por padrão). Se usar Redis no futuro, configurar:
  # self.cache.store = Redis::Store.new("#{ENV.fetch('REDIS_URL', 'redis://localhost:6379/0')}")

  # Safelist: IPs internos e health-checks
  safelist('allow-local-and-health') do |req|
    internal_ips = (ENV['RACK_ATTACK_SAFELIST_IPS'] || '').split(',').map(&:strip).reject(&:empty?)
    is_internal = internal_ips.any? { |ip| req.ip == ip }
    is_health = req.path.start_with?('/health') || req.path.start_with?('/up')
    is_internal || is_health
  end

  # Throttle /login por IP: 5/min
  throttle('login/ip', limit: (ENV.fetch('RACK_ATTACK_LOGIN_PER_IP_LIMIT', '5')).to_i, period: 1.minute) do |req|
    req.ip if req.post? && req.path.start_with?('/api/v1/login')
  end

  # Throttle /login por e-mail: 10/10min
  throttle('login/email', limit: (ENV.fetch('RACK_ATTACK_LOGIN_PER_EMAIL_LIMIT', '10')).to_i, period: 10.minutes) do |req|
    if req.post? && req.path.start_with?('/api/v1/login')
      begin
        body = req.body.read
        req.body.rewind
        params = JSON.parse(body) rescue {}
        email = params.dig('usuario', 'login') || params['login']
        email&.downcase
      rescue
        nil
      end
    end
  end

  # Throttle /auth/refresh por device: 30/min
  throttle('refresh/device', limit: (ENV.fetch('RACK_ATTACK_REFRESH_PER_DEVICE_LIMIT', '30')).to_i, period: 1.minute) do |req|
    if req.post? && req.path.start_with?('/api/v1/auth/refresh')
      device_id = req.get_header('HTTP_X_DEVICE_ID')
      ua = req.get_header('HTTP_USER_AGENT')
      ip = req.ip
      base = device_id.presence || Digest::SHA256.hexdigest("#{ua}|#{ip}")
      base
    end
  end
end