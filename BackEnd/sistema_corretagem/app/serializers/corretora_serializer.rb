class CorretoraSerializer < ActiveModel::Serializer
  attributes :id, :nome_fantasia, :razao_social, :cnpj, :creci_juridico
end