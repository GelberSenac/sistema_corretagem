class Api::V1::RelatoriosController < ApplicationController
  def propostas_por_status
    # Usamos o método `group` do Active Record para agrupar as propostas por status
    # e o `count` para contar o número de ocorrências em cada grupo.
    # O resultado será um hash, como: { "pendente" => 10, "aceita" => 5, ... }
    contagem_propostas = Proposta.group(:status).count

    # Para garantir que todos os status sejam retornados, mesmo que a contagem seja zero,
    # podemos inicializar um hash com todos os status possíveis do enum e mesclá-lo com o resultado.
    status_possiveis = Proposta.statuses.keys.map { |status| [status, 0] }.to_h
    relatorio_final = status_possiveis.merge(contagem_propostas)

    render json: relatorio_final
  end
end
