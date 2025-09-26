class ImovelSerializer < ActiveModel::Serializer
  include Rails.application.routes.url_helpers

  attributes :id, :nome_empreendimento, :tipo, :finalidade, :condicao, :descricao,
             :quartos, :suites, :banheiros, :vagas_garagem, :metragem,
             :ano_construcao, :valor, :valor_condominio, :valor_iptu,
             :comodidades, :status, :photos_urls

  has_one :endereco
  belongs_to :corretor # O corretor que cadastrou

  def photos_urls
    # Gera as URLs completas para o front-end consumir
    object.photos.map { |photo| url_for(photo) } if object.photos.attached?
  end
end