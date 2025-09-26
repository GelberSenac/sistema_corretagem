# app/models/proposta.rb
class Proposta < ApplicationRecord
  belongs_to :usuario
  belongs_to :cliente
  belongs_to :imovel
  belongs_to :corretora, optional: true

  # Adicione este enum
  enum :status, {
    em_analise: 'em_analise',
    contraproposta: 'contraproposta',
    aceita: 'aceita',
    recusada: 'recusada',
    documentacao: 'documentacao',
    concluida: 'concluida',
    cancelada: 'cancelada'
  }  
end