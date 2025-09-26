# app/models/perfil_busca.rb
class PerfilBusca < ApplicationRecord
  # Esta linha já foi adicionada pelo gerador
  belongs_to :cliente

  # É uma boa prática dar um "nome" para a busca
  validates :titulo_busca, presence: true

  # Adicione outras validações conforme a necessidade do negócio
  validates :valor_maximo_imovel, presence: true, numericality: { greater_than: 0 }
  validates :quartos_minimo, numericality: { only_integer: true, greater_than_or_equal_to: 0 }, allow_nil: true
end