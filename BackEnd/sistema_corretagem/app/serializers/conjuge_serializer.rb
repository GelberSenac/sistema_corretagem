class ConjugeSerializer < ActiveModel::Serializer
  attributes :id, :nome, :data_nascimento, :cpf, :rg, :profissao, :renda, 
             :email, :celular, :nacionalidade, :data_casamento, :regime_bens
end