# app/validators/cpf_validator.rb
class CpfValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    # Se o valor não for um CPF válido (usando a gem)...
    return if CPF.valid?(value)
    # ...adiciona uma mensagem de erro ao campo.
    record.errors.add(attribute, :invalid, message: "não é um CPF válido")
  end
end