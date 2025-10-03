# app/models/conjuge.rb
class Conjuge < ApplicationRecord
  include CpfValidatable
  include RegimeDeBensDefinivel

  belongs_to :cliente

  before_validation :normalize_celular
  
  validates :nome, presence: true
  
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }, allow_blank: true
  validates :renda, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true

  private

  def normalize_celular
    self.celular = celular.gsub(/\D/, '') if celular.present?
  end
end