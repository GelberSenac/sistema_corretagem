# app/models/corretora.rb

class Corretora < ApplicationRecord
  # --- Associações ---
  has_many :vinculos, dependent: :destroy
  has_many :propostas, dependent: :destroy
  
  # Usando sua associação mais clara com 'source'
  has_many :corretores, through: :vinculos, source: :usuario

  # --- Validações ---
  # Adicionando as validações para garantir a integridade dos dados
  validates :nome_fantasia, presence: true
  validates :razao_social, presence: true
  validates :cnpj, presence: true, uniqueness: true
  validates :creci_juridico, presence: true, uniqueness: true

  # --- Métodos de Instância ---
  # Mantendo seu método útil para encontrar gerentes
  def gerentes
    self.corretores.where(role: :gerente)
  end

  # Outro exemplo de método útil
  def corretores_simples
    self.corretores.where(role: :corretor)
  end
end