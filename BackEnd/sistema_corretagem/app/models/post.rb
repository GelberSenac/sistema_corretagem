class Post < ApplicationRecord
  belongs_to :usuario
  
  validates :titulo, presence: true, length: { maximum: 200 }
  validates :conteudo, presence: true
end
