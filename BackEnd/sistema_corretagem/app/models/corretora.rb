class Corretora < ApplicationRecord
  # --- Associações ---
  has_many :vinculos, dependent: :destroy
  has_many :propostas, dependent: :destroy
  
  # Associações através de outra tabela
  has_many :corretores, through: :vinculos, source: :usuario

  # --- Métodos de Instância ---
  def gerentes
    self.corretores.where(role: :gerente)
  end
end