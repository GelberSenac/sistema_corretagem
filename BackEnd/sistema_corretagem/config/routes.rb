# config/routes.rb
Rails.application.routes.draw do
  
  # --- API Namespace ---
  namespace :api do
    namespace :v1 do
      
      # --- Rotas de Autenticação e Dashboard ---
      post '/login', to: 'sessoes#create'
      get '/dashboard_stats', to: 'dashboard#index'

      # --- Rotas Principais (CRUDs) ---
      
      # ALTERAÇÃO AQUI: Deixamos as rotas de usuário mais explícitas.
      # Definimos apenas as ações que a nossa API realmente usa (não temos 'new' ou 'edit').
      # E mapeamos a rota DELETE para a nossa ação customizada 'deactivate'.
      resources :usuarios, only: [:index, :show, :create, :update]
      delete '/usuarios/:id', to: 'usuarios#deactivate'


      resources :clientes do
        resources :perfis_busca, only: [:index, :create, :show, :update, :destroy]
      end
      
      resources :imoveis do
        collection do
          get :buscar
        end
      end
      
      resources :caracteristicas, only: [:index]
      resources :agendamentos
      resources :lancamento_financeiros

      # --- Rotas de Relatórios ---
      get '/relatorios/propostas_por_status', to: 'relatorios#propostas_por_status'


      # Esta seção já estava perfeita.
      resources :propostas, only: [:create, :show, :index] do
        member do
          patch :aceitar
          patch :recusar
          patch :cancelar
        end
      end
      
    end
  end

  # Rota de health check
  get "up" => "rails/health#show", as: :rails_health_check
end