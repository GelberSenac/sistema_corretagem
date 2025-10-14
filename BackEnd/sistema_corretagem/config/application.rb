# config/application.rb

require_relative "boot"

require "rails/all"

Bundler.require(*Rails.groups)

module SistemaCorretagem
  class Application < Rails::Application
    config.load_defaults 8.0
    config.autoload_lib(ignore: %w[assets tasks])
    config.api_only = true

    # Habilita cookies em API-only para setar HttpOnly cookies de refresh
    # Segurança: sessões não são usadas; apenas cookies para refresh tokens
    config.middleware.use ActionDispatch::Cookies
    # Opcional: se futuramente usar sessões, adicionar o CookieStore
    # config.middleware.use ActionDispatch::Session::CookieStore, key: '_sistema_corretagem_session'

    # Esta é a única configuração de CORS necessária e está no lugar certo
    # Agora parametrizada via variável de ambiente CORS_ALLOWED_ORIGINS
    config.middleware.insert_before 0, Rack::Cors do
      allow do
        origins_env = ENV["CORS_ALLOWED_ORIGINS"]
        allowed_origins = if origins_env && !origins_env.strip.empty?
          origins_env.split(",").map { |o| o.strip }
        else
          [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:8082",
            "http://localhost:8084"
          ]
        end
        origins allowed_origins
        resource '*', headers: :any, methods: [:get, :post, :put, :patch, :delete, :options], expose: ['Total-Count','Page-Items','Per-Page','Current-Page','Total-Pages','Link'], credentials: true
      end
    end

    # Rack::Attack para rate limiting e safelist de IPs internos/health
    config.middleware.use Rack::Attack
  end
end