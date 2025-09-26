class PropostaSerializer < ActiveModel::Serializer
  attributes :id, :valor_proposta, :status, :condicoes_pagamento

  belongs_to :cliente
  belongs_to :imovel
  belongs_to :corretora
  belongs_to :usuario, key: :corretor # Renomeia 'usuario' para 'corretor' no JSON
end