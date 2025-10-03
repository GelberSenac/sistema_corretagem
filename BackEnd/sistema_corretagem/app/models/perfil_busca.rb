# app/models/perfil_busca.rb
class PerfilBusca < ApplicationRecord
  # --- Associações ---
  belongs_to :cliente

  # --- FASE 3: Enums para Consistência com o Imóvel ---
  # Esta linha "ensina" o Rails a tratar a coluna de texto como um Array
  serialize :bairro_preferencia, Array

  # Usamos os mesmos nomes e valores do enum do modelo 'Imovel' para facilitar a comparação.
  # Note que o nome do campo na sua tabela é 'tipo_negocio', mas no enum o chamamos
  # de 'finalidade' para manter a consistência com o modelo Imovel. O Rails mapeia isso sem problemas.
  enum :finalidade, { venda: 0, aluguel: 1 }, _prefix: :finalidade
  
  # A mesma lógica se aplica aqui para a condição do imóvel.
  enum :condicao, { lancamento: 0, em_obras: 1, usado: 2 }, _prefix: :condicao

  # --- Validações Completas ---
  validates :titulo_busca, presence: true

  # Validações para os campos numéricos. 'allow_nil: true' torna o campo opcional.
  validates :valor_maximo_imovel, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validates :valor_entrada_disponivel, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validates :renda_minima_exigida, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true

  # Validações para os campos de características do imóvel (quartos, suítes, etc.)
  validates :quartos_minimo, numericality: { only_integer: true, greater_than_or_equal_to: 0 }, allow_nil: true
  validates :suites_minimo, numericality: { only_integer: true, greater_than_or_equal_to: 0 }, allow_nil: true
  validates :banheiros_minimo, numericality: { only_integer: true, greater_than_or_equal_to: 0 }, allow_nil: true
  validates :vagas_minimo, numericality: { only_integer: true, greater_than_or_equal_to: 0 }, allow_nil: true
  validates :metragem_minima, numericality: { only_integer: true, greater_than_or_equal_to: 0 }, allow_nil: true

  # Validação para o campo booleano, garante que seja 'true' ou 'false', não nulo.
  validates :exige_varanda, inclusion: { in: [true, false] }
end