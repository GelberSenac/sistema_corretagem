class LancamentoFinanceiro < ApplicationRecord
  belongs_to :usuario
  belongs_to :proposta

  enum :tipo, { receita: 0, despesa: 1 }

  validates :descricao, presence: true
  validates :valor, presence: true
  validates :tipo, presence: true
  validates :data_lancamento, presence: true
end
