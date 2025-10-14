class Comodo < ApplicationRecord
  belongs_to :imovel, inverse_of: :comodo

  # Garantir relação 1:1 no nível de modelo
  validates :imovel, presence: true
  validates :imovel_id, uniqueness: true
end