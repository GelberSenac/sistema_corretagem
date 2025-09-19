class Usuario < ApplicationRecord
  has_secure_password
  has_many :enderecos, dependent: :destroy
  has_many :posts

  validates :nome, presence: true, length: { maximum: 100 }
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :login, presence: true, uniqueness: true, length: { minimum: 4, maximum: 20 }
  validates :cpf, presence: true, uniqueness: true, format: { with: /\A\d{3}\.\d{3}\.\d{3}-\d{2}\z/, message: "deve estar no formato XXX.XXX.XXX-XX" }
  validates :ativo, inclusion: { in: [true, false] }
end
