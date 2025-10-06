class Usuario < ApplicationRecord
  include CpfValidatable # Adicione esta linha

  has_secure_password
  enum :role, { corretor: 0, admin: 1, gerente: 2 }

  # --- Callbacks ---
  before_validation :normalize_cpf
  before_validation :ensure_ativo_boolean

  # --- Associações ---
  has_many :clientes, foreign_key: 'usuario_id', dependent: :restrict_with_error
  has_many :imoveis, foreign_key: 'usuario_id', dependent: :restrict_with_error
  # Nota: associações como :perfil_corretor ou :vinculos podem continuar com :destroy,
  # pois esses dados não têm valor histórico sem o usuário.

  has_many :propostas, dependent: :destroy
  has_many :vinculos, dependent: :destroy
  has_one :perfil_corretor, dependent: :destroy
  has_one :endereco, as: :enderecoable, dependent: :destroy
  has_many :corretoras, through: :vinculos
  
  accepts_nested_attributes_for :endereco
  accepts_nested_attributes_for :perfil_corretor
  
  # --- Validações ---
  validates :nome, presence: true, length: { maximum: 100 }
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :login, presence: true, uniqueness: true, length: { minimum: 4, maximum: 20 }
  validates :ativo, inclusion: { in: [true, false] }
  
  private

  def ensure_ativo_boolean
    if ativo.nil?
      self.ativo = true
    elsif ativo.is_a?(String)
      down = ativo.strip.downcase
      self.ativo = case down
                   when 'true', 't', '1', 's', 'sim' then true
                   when 'false', 'f', '0', 'n', 'nao', 'não' then false
                   else
                     ativo
                   end
    end
  end
end
