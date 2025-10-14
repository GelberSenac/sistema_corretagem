class ClienteSerializer < ActiveModel::Serializer
  attributes :id, :nome, :rg, :cpf, :sexo, :email, :telefone, :data_nascimento,
             :estado_civil, :profissao, :renda, :nacionalidade,
             :data_casamento, :regime_bens, :renda_familiar_total

  # Associações que queremos incluir no JSON
  belongs_to :corretor
  has_one :endereco
  has_one :conjuge

  # Serialização segura para valores monetários como string
  def renda
    v = object.renda
    return nil if v.nil?
    v.is_a?(BigDecimal) ? v.to_s('F') : v.to_s
  end

  # Atributo customizado que chama o método do nosso modelo, padronizado como string
  def renda_familiar_total
    v = object.renda_familiar_total
    return nil if v.nil?
    v.is_a?(BigDecimal) ? v.to_s('F') : v.to_s
  end
end