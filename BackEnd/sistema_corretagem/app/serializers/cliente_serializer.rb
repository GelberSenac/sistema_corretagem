class ClienteSerializer < ActiveModel::Serializer
  attributes :id, :nome, :rg, :cpf, :sexo, :email, :telefone, :data_nascimento,
             :estado_civil, :profissao, :renda, :nacionalidade,
             :data_casamento, :regime_bens, :renda_familiar_total

  # Associações que queremos incluir no JSON
  belongs_to :corretor
  has_one :endereco
  has_one :conjuge

  # Atributo customizado que chama o método do nosso modelo
  def renda_familiar_total
    object.renda_familiar_total
  end
end