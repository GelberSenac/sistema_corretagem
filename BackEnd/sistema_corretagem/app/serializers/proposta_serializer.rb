class PropostaSerializer < ActiveModel::Serializer
  attributes :id, :valor_proposta, :status, :condicoes_pagamento, :perfil_busca_id, :perfil_busca_snapshot

  belongs_to :cliente
  belongs_to :imovel
  belongs_to :corretora
  belongs_to :usuario, key: :corretor # Renomeia 'usuario' para 'corretor' no JSON

  # Serialização segura para valores monetários como string
  def valor_proposta
    v = object.valor_proposta
    return nil if v.nil?
    v.is_a?(BigDecimal) ? v.to_s('F') : v.to_s
  end
end