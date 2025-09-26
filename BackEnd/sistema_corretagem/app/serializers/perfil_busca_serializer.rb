class PerfilBuscaSerializer < ActiveModel::Serializer
  attributes :id, :titulo_busca, :tipo_negocio, :condicao_imovel, 
             :bairro_preferencia, :valor_maximo_imovel, :valor_entrada_disponivel,
             :renda_minima_exigida, :quartos_minimo, :suites_minimo, 
             :banheiros_minimo, :vagas_minimo, :metragem_minima, :exige_varanda

  belongs_to :cliente
end