class Cliente < ApplicationRecord
  include CpfValidatable # Adicione esta linha

  # --- Enums ---
  enum :estado_civil, { solteiro: 0, casado: 1, divorciado: 2, viuvo: 3, uniao_estavel: 4 }


  # --- Callback ---
  before_validation :normalize_telefone # Adicionar perto dos outros callbacks

  # --- Associações ---
  belongs_to :corretor, class_name: 'Usuario', foreign_key: 'usuario_id'
  has_one :endereco, as: :enderecoable, dependent: :destroy
  has_many :perfis_busca, class_name: 'PerfilBusca', dependent: :destroy
  has_one :conjuge, dependent: :destroy
  has_many :propostas, dependent: :destroy
  
  accepts_nested_attributes_for :endereco, allow_destroy: true
  accepts_nested_attributes_for :conjuge, reject_if: :all_blank, allow_destroy: true

  # --- Validações ---
  validates :nome, presence: true
  validates :telefone, presence: true
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :data_nascimento, presence: true
  validates :estado_civil, presence: true
  validates :profissao, presence: true
  validates :renda, presence: true, numericality: { greater_than_or_equal_to: 0 }
  
  # --- Métodos de Instância ---
  def renda_familiar_total
    self.renda + (self.conjuge&.renda || 0)
  end

  private

  def normalize_telefone
    self.telefone = telefone.gsub(/\D/, '') if telefone.present?
  end

end