class Usuario < ApplicationRecord
  has_secure_password
  enum :role, { corretor: 0, admin: 1, gerente: 2 }

  # --- Associações ---
  # O que um usuário tem diretamente
  has_many :clientes, foreign_key: 'usuario_id', dependent: :destroy
  has_many :imoveis, foreign_key: 'usuario_id', dependent: :destroy
  has_many :propostas, dependent: :destroy
  has_many :vinculos, dependent: :destroy
  has_one :perfil_corretor, dependent: :destroy
  has_one :endereco, as: :enderecoable, dependent: :destroy
  
  # O que um usuário tem através de outra tabela
  has_many :corretoras, through: :vinculos
  
  # Para formulários aninhados
  accepts_nested_attributes_for :endereco
  accepts_nested_attributes_for :perfil_corretor
  
  # --- Validações ---
  validates :nome, presence: true, length: { maximum: 100 }
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :login, presence: true, uniqueness: true, length: { minimum: 4, maximum: 20 }
  validates :cpf, presence: true, uniqueness: true, format: { with: /\A\d{3}\.\d{3}\.\d{3}-\d{2}\z/, message: "deve estar no formato XXX.XXX.XXX-XX" }
  validates :ativo, inclusion: { in: [true, false] }
end