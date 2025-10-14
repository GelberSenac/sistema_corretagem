class ImovelSerializer < ActiveModel::Serializer
  include Rails.application.routes.url_helpers

  attributes :id, :nome_empreendimento, :tipo, :finalidade, :condicao, :descricao,
             :quartos, :suites, :banheiros, :vagas_garagem, :metragem,
             :ano_construcao, :valor, :valor_condominio, :valor_iptu,
             :comodidades, :status, :photos_urls, :photos_thumb_urls, :photos_attachments, :comodo, :infraestrutura, :piso, :posicao, :proximidade

  has_one :endereco
  belongs_to :corretor # O corretor que cadastrou

  # Serialização segura para valores monetários como string
  def valor
    v = object.valor
    return nil if v.nil?
    v.is_a?(BigDecimal) ? v.to_s('F') : v.to_s
  end

  def valor_condominio
    v = object.valor_condominio
    return nil if v.nil?
    v.is_a?(BigDecimal) ? v.to_s('F') : v.to_s
  end

  def valor_iptu
    v = object.valor_iptu
    return nil if v.nil?
    v.is_a?(BigDecimal) ? v.to_s('F') : v.to_s
  end

  def comodo
    c = object.comodo
    return nil unless c
    {
      area_de_servico: c.area_de_servico,
      cozinha: c.cozinha,
      sala_de_estar: c.sala_de_estar,
      sala_de_jantar: c.sala_de_jantar,
      suite: c.suite,
      varanda: c.varanda,
      wc_social: c.wc_social,
      wc_de_servico: c.wc_de_servico,
      despensa: c.despensa,
      quarto_de_servico: c.quarto_de_servico,
      sala_de_visita: c.sala_de_visita,
      banheiro_social: c.banheiro_social,
      lavabo: c.lavabo,
      escritorio: c.escritorio,
      home_office: c.home_office,
      closet: c.closet,
      hall: c.hall,
      sala_de_tv: c.sala_de_tv,
      terraco: c.terraco
    }
  end

  def photos_urls
    object.photos.map { |photo| url_for(photo) } if object.photos.attached?
  end

  def photos_thumb_urls
    return [] unless object.photos.attached?

    object.photos.map do |photo|
      begin
        variant = photo.variant(resize_to_fill: [600, 400]).processed
        url_for(variant)
      rescue => e
        url_for(photo)
      end
    end
  end

  # Expor metadados das fotos para permitir remoção seletiva no frontend
  def photos_attachments
    return [] unless object.photos.attached?

    object.photos.map do |photo|
      thumb = begin
        variant = photo.variant(resize_to_fill: [600, 400]).processed
        url_for(variant)
      rescue
        url_for(photo)
      end

      {
        id: photo.id,
        url: url_for(photo),
        thumb_url: thumb
      }
    end
  end

  def infraestrutura
    i = object.infraestrutura
    return nil unless i
    {
      garagem: i.garagem,
      lavanderia: i.lavanderia,
      jardim_interno: i.jardim_interno,
      jardim_externo: i.jardim_externo,
      piscina: i.piscina,
      playground: i.playground,
      portaria_24h: i.portaria_24h,
      salao_de_festas: i.salao_de_festas,
      sistema_de_seguranca: i.sistema_de_seguranca,
      churrasqueira: i.churrasqueira,
      elevador: i.elevador,
      sauna: i.sauna,
      quadra_poliesportiva: i.quadra_poliesportiva,
      academia: i.academia,
      campo_de_futebol: i.campo_de_futebol,
      bicicletario: i.bicicletario,
      area_de_lazer: i.area_de_lazer,
      central_de_gas: i.central_de_gas,
      portao_eletronico: i.portao_eletronico,
      gerador: i.gerador,
      interfone: i.interfone,
      guarita: i.guarita,
      monitoramento: i.monitoramento,
      cftv: i.cftv,
      brinquedoteca: i.brinquedoteca,
      salao_de_jogos: i.salao_de_jogos,
      spa: i.spa,
      coworking: i.coworking,
      pet_place: i.pet_place,
      car_wash: i.car_wash,
      mini_mercado: i.mini_mercado,
      estacionamento_visitantes: i.estacionamento_visitantes
    }
  end

  def piso
    p = object.piso
    return nil unless p
    {
      porcelanato: p.porcelanato,
      ceramica: p.ceramica,
      granito: p.granito,
      laminado: p.laminado,
      madeira: p.madeira,
      vinilico: p.vinilico,
      carpete: p.carpete,
      ardosia: p.ardosia,
      marmore: p.marmore,
      taco: p.taco
    }
  end

  def posicao
    po = object.posicao
    return nil unless po
    {
      nascente: po.nascente,
      vista_para_o_mar: po.vista_para_o_mar,
      beira_mar: po.beira_mar,
      poente: po.poente,
      frente_para_o_mar: po.frente_para_o_mar,
      norte: po.norte,
      sul: po.sul,
      leste: po.leste,
      oeste: po.oeste
    }
  end

  def proximidade
    pr = object.proximidade
    return nil unless pr
    {
      bares_e_restaurantes: pr.bares_e_restaurantes,
      escola: pr.escola,
      faculdade: pr.faculdade,
      farmacia: pr.farmacia,
      hospital: pr.hospital,
      padaria: pr.padaria,
      pet_shop: pr.pet_shop,
      shopping_center: pr.shopping_center,
      supermercado: pr.supermercado,
      banco: pr.banco,
      shopping: pr.shopping,
      praia: pr.praia,
      parque: pr.parque,
      metro: pr.metro,
      estacao_de_metro: pr.estacao_de_metro,
      estacao: pr.estacao,
      ponto_de_onibus: pr.ponto_de_onibus,
      terminal: pr.terminal,
      igreja: pr.igreja,
      feira: pr.feira,
      mercado: pr.mercado,
      posto_de_gasolina: pr.posto_de_gasolina,
      delegacia: pr.delegacia,
      correios: pr.correios,
      loterica: pr.loterica,
      universidade: pr.universidade,
      creche: pr.creche
    }
  end
end