# config/application.rb

require_relative "boot"

require "rails/all"

Bundler.require(*Rails.groups)

module SistemaCorretagem
  class Application < Rails::Application
    config.load_defaults 8.0
    config.autoload_lib(ignore: %w[assets tasks])
    config.api_only = true

    # Esta é a única configuração de CORS necessária e está no lugar certo
    config.middleware.insert_before 0, Rack::Cors do
      allow do
        origins '*'
        resource '*', headers: :any, methods: [:get, :post, :put, :patch, :delete, :options]
      end
    end
  end
end