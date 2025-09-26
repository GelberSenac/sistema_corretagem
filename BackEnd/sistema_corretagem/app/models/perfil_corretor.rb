class PerfilCorretor < ApplicationRecord
  belongs_to :usuario
  
  validates :creci, presence: true, uniqueness: true
  validates :creci_estado, presence: true, length: { is: 2 } 
end
