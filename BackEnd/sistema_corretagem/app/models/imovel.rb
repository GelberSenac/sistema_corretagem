class Imovel < ApplicationRecord
  # --- Associações ---
  belongs_to :corretor, class_name: 'Usuario', foreign_key: 'usuario_id'
  has_one :endereco, as: :enderecoable, dependent: :destroy

  has_many :propostas, dependent: :restrict_with_error
  has_many :imoveis_caracteristicas, class_name: 'ImoveisCaracteristica', dependent: :destroy
  has_many :caracteristicas, through: :imoveis_caracteristicas

  has_many_attached :photos

  accepts_nested_attributes_for :endereco

  # --- Enums ---
  enum :tipo, { apartamento: 0, casa: 1, flat: 2, cobertura: 3, kitnet: 4, terreno: 5 }
  enum :finalidade, { venda: 0, aluguel: 1 }
  enum :condicao, { lancamento: 0, em_obras: 1, usado: 2 }
  enum :status, { disponivel: 0, reservado: 1, vendido: 2, cancelado: 3 }
  enum :posicao_solar, { norte: 0, sul: 1, leste: 2, oeste: 3 }

  # --- Validações ---
  validates :nome_empreendimento, presence: true
  validates :tipo, presence: true
  validates :finalidade, presence: true
  validates :condicao, presence: true
  validates :valor, presence: true, numericality: { greater_than: 0 }
  validates :quartos, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :metragem, presence: true, numericality: { only_integer: true, greater_than: 0 }
  validates :banheiros, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :suites, numericality: { only_integer: true, greater_than_or_equal_to: 0 }, allow_nil: true
  validates :vagas_garagem, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :valor_condominio, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validates :valor_iptu, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validates :descricao, presence: true  

  # --- Scopes para Filtros ---
  scope :por_bairro, ->(bairros) {
    # Usa joins() para conectar com a tabela enderecos
    # e where() para filtrar na coluna 'bairro' da tabela 'enderecos' (no plural)
    joins(:endereco).where(enderecos: { bairro: bairros }) if bairros.present?
  }
  scope :com_valor_minimo, ->(min) { where("valor >= ?", min) if min.present? }
  scope :com_valor_maximo, ->(max) { where("valor <= ?", max) if max.present? }
  scope :com_quartos_minimo, ->(num) { where("quartos >= ?", num) if num.present? }
  scope :com_tipo, ->(tipo) { where(tipo: tipo) if tipo.present? }
end