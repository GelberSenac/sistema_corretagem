class Endereco < ApplicationRecord
  belongs_to :usuario

  validates :logradouro, presence: true, length: { maximum: 150 }
  validates :numero, presence: true, length: { maximum: 10 }
  validates :complemento, presence: false, length: { maximum: 50 }
  validates :bairro, presence: true, length: { maximum: 100 }
  validates :cidade, presence: true, length: { maximum: 100 }
  validates :estado, presence: true, length: { is: 2 }
  validates :cep, presence: true, format: { with: /\A\d{5}-\d{3}\z/, message: "deve estar no formato XXXXX-XXX" }
end
