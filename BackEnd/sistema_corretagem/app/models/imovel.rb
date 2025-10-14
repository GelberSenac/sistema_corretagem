class Imovel < ApplicationRecord
  # --- Associações ---
  belongs_to :corretor, class_name: 'Usuario', foreign_key: 'usuario_id'
  has_one :endereco, as: :enderecoable, dependent: :destroy

  has_many :propostas, dependent: :restrict_with_error
  has_many :imoveis_caracteristicas, class_name: 'ImoveisCaracteristica', dependent: :destroy
  has_many :caracteristicas, through: :imoveis_caracteristicas

  has_many_attached :photos

  accepts_nested_attributes_for :endereco
  has_one :comodo, dependent: :destroy, inverse_of: :imovel
  accepts_nested_attributes_for :comodo
  has_one :infraestrutura, dependent: :destroy, inverse_of: :imovel
  accepts_nested_attributes_for :infraestrutura
  has_one :piso, dependent: :destroy, inverse_of: :imovel
  accepts_nested_attributes_for :piso
  has_one :posicao, dependent: :destroy, inverse_of: :imovel
  accepts_nested_attributes_for :posicao
  has_one :proximidade, dependent: :destroy, inverse_of: :imovel
  accepts_nested_attributes_for :proximidade

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
  validates :metragem, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :banheiros, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :suites, numericality: { only_integer: true, greater_than_or_equal_to: 0 }, allow_nil: true
  validates :vagas_garagem, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :valor_condominio, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validates :valor_iptu, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validates :descricao, presence: true  

  # Validações de anexos (fotos)
  validate :acceptable_photos

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

  private

  def acceptable_photos
    return unless photos.attached?

    max_bytes = ENV.fetch('MAX_UPLOAD_SIZE_MB', '8').to_i * 1024 * 1024
    allowed_types = ENV.fetch('ALLOWED_IMAGE_TYPES', 'image/jpeg,image/png,image/webp').split(',')

    photos.each do |photo|
      blob = photo.blob
      next unless blob

      if blob.byte_size > max_bytes
        errors.add(:photos, "arquivo muito grande (máx #{ENV.fetch('MAX_UPLOAD_SIZE_MB', '8')} MB)")
      end

      unless allowed_types.include?(blob.content_type)
        errors.add(:photos, "tipo não permitido: #{blob.content_type}. Permitidos: #{allowed_types.join(', ')}")
      end
    end
  end
end