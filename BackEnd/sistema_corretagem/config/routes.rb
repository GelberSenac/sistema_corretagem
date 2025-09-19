Rails.application.routes.draw do
  get "dashboard/index"
  get '/usuarios', to: 'usuarios#index'
  get '/usuarios/:id', to: 'usuarios#show'
  post '/usuarios', to: 'usuarios#create'
  get '/usuarios/new', to: 'usuarios#new'
  get '/usuarios/:id/edit', to: 'usuarios#edit'
  patch '/usuarios/:id', to: 'usuarios#update'
  put '/usuarios/:id', to: 'usuarios#update'
  delete '/usuarios/:id', to: 'usuarios#destroy'
  
  get '/enderecos', to: 'enderecos#index'
  get '/enderecos/:id', to: 'enderecos#show'
  post '/enderecos', to: 'enderecos#create'
  get '/enderecos/new', to: 'enderecos#new'
  get '/enderecos/:id/edit', to: 'enderecos#edit'
  patch '/enderecos/:id', to: 'enderecos#update'
  put '/enderecos/:id', to: 'enderecos#update'
  delete '/enderecos/:id', to: 'enderecos#destroy'
  
  post '/login', to: 'sessoes#create'

  get '/dashboard_stats', to: 'dashboard#index'
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"
end
