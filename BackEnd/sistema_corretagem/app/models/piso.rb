class Piso < ApplicationRecord
  belongs_to :imovel, inverse_of: :piso

  # Relação 1:1 garantida
  validates :imovel, presence: true
  validates :imovel_id, uniqueness: true
end