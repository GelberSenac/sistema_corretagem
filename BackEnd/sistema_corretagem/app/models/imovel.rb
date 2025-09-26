class Imovel < ApplicationRecord
  # --- Associações ---
  belongs_to :corretor, class_name: 'Usuario', foreign_key: 'usuario_id'
  has_one :endereco, as: :enderecoable, dependent: :destroy
  has_many :propostas, dependent: :destroy
  has_many_attached :photos

  accepts_nested_attributes_for :endereco

  # --- Enums ---
  enum :tipo, { apartamento: 0, casa: 1, flat: 2, cobertura: 3, kitnet: 4, terreno: 5 }
  enum :finalidade, { venda: 0, aluguel: 1 }
  enum :condicao, { lancamento: 0, em_obras: 1, usado: 2 }
  enum :status, { disponivel: 0, reservado: 1, vendido: 2, cancelado: 3 }

  # --- Validações ---
  validates :nome_empreendimento, presence: true
  validates :tipo, presence: true
  validates :finalidade, presence: true
  validates :condicao, presence: true
  validates :valor, presence: true, numericality: { greater_than: 0 }
  validates :quartos, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :metragem, presence: true, numericality: { only_integer: true, greater_than: 0 }

  # --- Scopes para Filtros ---
  scope :por_bairro, ->(bairros) { where(bairro: bairros) if bairros.present? }
  scope :com_valor_minimo, ->(min) { where("valor >= ?", min) if min.present? }
  scope :com_valor_maximo, ->(max) { where("valor <= ?", max) if max.present? }
  scope :com_quartos_minimo, ->(num) { where("quartos >= ?", num) if num.present? }
  scope :com_tipo, ->(tipo) { where(tipo: tipo) if tipo.present? }
end