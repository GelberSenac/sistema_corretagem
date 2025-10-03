# app/models/caracteristica.rb

class Caracteristica < ApplicationRecord
  has_many :imoveis_caracteristicas, dependent: :destroy
  has_many :imoveis, through: :imoveis_caracteristicas

  # --- ALTERAÇÃO FINAL AQUI ---
  # Adiciona o enum para definir os tipos válidos e fazer a tradução de 0 e 1.
  enum :tipo_caracteristica, { privativa: 0, comum: 1 }

  validates :nome, presence: true, uniqueness: { scope: :tipo_caracteristica }
end