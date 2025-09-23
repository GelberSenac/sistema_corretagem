class Cliente < ApplicationRecord
  has_one :endereco, as: :enderecoable, dependent: :destroy
  accepts_nested_attributes_for :endereco
end