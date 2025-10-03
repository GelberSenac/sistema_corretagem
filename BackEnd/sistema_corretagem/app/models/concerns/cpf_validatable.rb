# app/models/concerns/cpf_validatable.rb
module CpfValidatable
  extend ActiveSupport::Concern

  included do
    # A validação de formato é aplicada usando o validador customizado
    validates :cpf, cpf: true, allow_blank: true

    # Callback para limpar o CPF antes de validar
    before_validation :normalize_cpf
  end

  private

  def normalize_cpf
    # Remove pontos, traços e outros caracteres não numéricos
    self.cpf = cpf.gsub(/\D/, '') if cpf.present?
  end
end