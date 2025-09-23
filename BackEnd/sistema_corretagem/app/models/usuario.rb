# app/models/usuario.rb

class Usuario < ApplicationRecord
  has_secure_password

  enum :role, {corretor:0,admin:1}


  has_one :endereco, as: :enderecoable, dependent: :destroy
  accepts_nested_attributes_for :endereco

  has_many :posts, dependent: :destroy

  validates :nome, presence: true, length: { maximum: 100 }
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :login, presence: true, uniqueness: true, length: { minimum: 4, maximum: 20 }
  validates :cpf, presence: true, uniqueness: true, format: { with: /\A\d{3}\.\d{3}\.\d{3}-\d{2}\z/, message: "deve estar no formato XXX.XXX.XXX-XX" }
  validates :ativo, inclusion: { in: [true, false] }
end