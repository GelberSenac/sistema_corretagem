# app/models/concerns/cpf_validatable.rb
module CpfValidatable
  extend ActiveSupport::Concern

  included do
    # Valida CPF somente quando presente e alterado
    validates :cpf, cpf: true, allow_blank: true, if: -> { cpf.present? && will_save_change_to_cpf? }

    # Callback para limpar o CPF antes de validar
    before_validation :normalize_cpf
  end

  private

  def normalize_cpf
    # Remove pontos, traços e outros caracteres não numéricos
    self.cpf = cpf.gsub(/\D/, '') if cpf.present?
  end
end