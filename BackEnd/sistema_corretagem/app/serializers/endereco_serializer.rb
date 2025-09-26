class EnderecoSerializer < ActiveModel::Serializer
  attributes :id, :logradouro, :numero, :complemento, :bairro, :cidade, :estado, :cep
end