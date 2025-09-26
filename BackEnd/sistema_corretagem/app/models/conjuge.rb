# app/models/conjuge.rb
class Conjuge < ApplicationRecord
  belongs_to :cliente

  # Adicione as validações de dados do Cônjuge aqui
  validates :nome, presence: true
  validates :cpf, 
            presence: true, 
            uniqueness: true,
            format: { with: /\A\d{3}\.\d{3}\.\d{3}-\d{2}\z/, message: "deve estar no formato XXX.XXX.XXX-XX" }
            
  validates :renda, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
end