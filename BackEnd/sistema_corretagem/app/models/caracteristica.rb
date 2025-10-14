# app/models/caracteristica.rb

class Caracteristica < ApplicationRecord
  has_many :imoveis_caracteristicas, class_name: 'ImoveisCaracteristica', dependent: :destroy
  has_many :imoveis, through: :imoveis_caracteristicas

  # --- ENUMS ---
  # tipo_caracteristica já existente, backed by integer
  enum :tipo_caracteristica, { privativa: 0, comum: 1 }
  # novo enum de categoria (backed by integer)
  enum :categoria, { comodos: 0, infraestrutura: 1, piso: 2, posicao: 3, proximidades: 4 }, allow_nil: true

  # --- VALIDACOES ---
  validates :nome, presence: true, uniqueness: { scope: :tipo_caracteristica }
end