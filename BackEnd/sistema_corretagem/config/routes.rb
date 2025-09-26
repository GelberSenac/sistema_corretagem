# config/routes.rb
Rails.application.routes.draw do
  
  # --- API Namespace ---
  # Todas as rotas da nossa API viverão sob o prefixo /api/v1/
  namespace :api do
    namespace :v1 do
      
      # --- Rotas Principais (CRUDs) ---
      resources :usuarios
      resources :clientes do
        # Um perfil de busca pertence a um cliente, então aninhamos a rota.
        # Só precisamos de 'index' (listar perfis) e 'create' (criar um novo).
        resources :perfis_busca, only: [:index, :create, :show, :update, :destroy]
      end
      
      resources :imoveis do
        # Rota customizada para a nossa busca/filtro dinâmico.
        # Isso cria o endpoint: GET /api/v1/imoveis/buscar
        collection do
          get :buscar
        end
      end
      
      resources :propostas, only: [:create, :show, :index] do
        # Rotas para ações específicas em uma proposta
        member do
          patch :aceitar
          patch :recusar
          patch :cancelar
          # Adicione outras ações conforme necessário
        end
      end
      
      # --- Rotas de Autenticação e Dashboard ---
      post '/login', to: 'sessoes#create'
      get '/dashboard_stats', to: 'dashboard#index'



    end
  end

  # Rota de health check do Rails (fora do namespace da API)
  get "up" => "rails/health#show", as: :rails_health_check
end