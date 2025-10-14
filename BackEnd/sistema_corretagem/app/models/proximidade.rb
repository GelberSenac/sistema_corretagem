class Proximidade < ApplicationRecord
  belongs_to :imovel, inverse_of: :proximidade

  # Relação 1:1 garantida
  validates :imovel, presence: true
  validates :imovel_id, uniqueness: true
end