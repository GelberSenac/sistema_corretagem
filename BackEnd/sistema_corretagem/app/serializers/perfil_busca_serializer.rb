class PerfilBuscaSerializer < ActiveModel::Serializer
  attributes :id, :titulo_busca, :finalidade, :condicao,
             :bairro_preferencia, :valor_maximo_imovel, :valor_entrada_disponivel,
             :renda_minima_exigida, :quartos_minimo, :suites_minimo,
             :banheiros_minimo, :vagas_minimo, :metragem_minima, :exige_varanda

  belongs_to :cliente

  # Serialização segura para valores monetários como string
  def valor_maximo_imovel
    v = object.valor_maximo_imovel
    return nil if v.nil?
    v.is_a?(BigDecimal) ? v.to_s('F') : v.to_s
  end

  def valor_entrada_disponivel
    v = object.valor_entrada_disponivel
    return nil if v.nil?
    v.is_a?(BigDecimal) ? v.to_s('F') : v.to_s
  end

  def renda_minima_exigida
    v = object.renda_minima_exigida
    return nil if v.nil?
    v.is_a?(BigDecimal) ? v.to_s('F') : v.to_s
  end
end