class Cliente < ApplicationRecord
  # --- Associações ---
  belongs_to :corretor, class_name: 'Usuario', foreign_key: 'usuario_id'
  has_one :endereco, as: :enderecoable, dependent: :destroy
  has_many :perfis_busca, dependent: :destroy
  has_one :conjuge, dependent: :destroy
  has_many :propostas, dependent: :destroy

  # Para formulários aninhados
  accepts_nested_attributes_for :endereco
  accepts_nested_attributes_for :conjuge

  # --- Validações ---
  validates :nome, presence: true
  validates :telefone, presence: true
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :cpf, presence: true, uniqueness: true
  validates :data_nascimento, presence: true
  validates :estado_civil, presence: true
  validates :profissao, presence: true
  validates :renda, presence: true, numericality: { greater_than_or_equal_to: 0 }
  
  # --- Métodos de Instância ---
  def renda_familiar_total
    self.renda + (self.conjuge&.renda || 0)
  end
end