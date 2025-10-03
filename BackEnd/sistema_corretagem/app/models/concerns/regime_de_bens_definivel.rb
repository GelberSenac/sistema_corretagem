# app/models/concerns/regime_de_bens_definivel.rb
module RegimeDeBensDefinivel
  extend ActiveSupport::Concern

  included do
    enum :regime_bens, { 
      comunhao_parcial: 0, 
      comunhao_universal: 1, 
      separacao_total: 2 
    }, prefix: true
  end
end