# app/models/proposta.rb
class Proposta < ApplicationRecord
  # --- Associações ---
  belongs_to :usuario
  belongs_to :cliente
  belongs_to :imovel
  belongs_to :corretora, optional: true
  # Associação opcional ao perfil de busca (para referência do snapshot)
  belongs_to :perfil_busca, optional: true

  # --- Enum ---
  # Seu enum já estava correto para usar inteiros.
  enum :status, {
     em_analise: 0,
     contraproposta: 1,
     aceita: 2,
     recusada: 3,
     documentacao: 4,
     concluida: 5,
     cancelada: 6
   }

  # --- FASE 2: Validações Essenciais ---

  # Garante que a proposta tenha um valor e que ele seja positivo.
  # Note que o nome do campo é 'valor_proposta' para bater com sua tabela.
  validates :valor_proposta, presence: true, numericality: { greater_than: 0 }

  # Garante que a data da proposta seja sempre informada (baseado na sugestão do Passo 2).
  # Se você não adicionou a coluna, pode remover esta linha.
  validates :data_proposta, presence: true

  # Uma proposta pode ter condições de pagamento, então garantimos que o campo não seja nulo.
  validates :condicoes_pagamento, presence: true


  # --- FASE 2: Regra de Negócio - Proposta Única Ativa ---

  # Impede que um mesmo cliente faça mais de uma proposta para o mesmo imóvel,
  # a menos que as propostas anteriores já tenham sido finalizadas (recusada, concluida, etc).
  validates :imovel_id, uniqueness: {
    scope: :cliente_id,
    message: "já possui uma proposta ativa para este imóvel.",
    conditions: -> { where.not(status: [:recusada, :concluida, :cancelada]) }
  }

  # --- FASE 3: Automação e Callbacks ---

  # Este callback será executado sempre que a proposta for salva,
  # mas apenas se o campo 'status' tiver sido alterado.
  after_save :sincronizar_status_imovel, if: :saved_change_to_status?
  after_destroy :liberar_imovel_se_necessario

  # --- Adicione este scope para facilitar a busca por propostas ativas ---
  scope :ativas, -> { where(status: [:em_analise, :contraproposta, :documentacao]) }

  private

  # Este método contém a lógica de automação.
  def sincronizar_status_imovel
    # Caso 1: A proposta foi aceita ou está na fase de documentação.
    if aceita? || documentacao?
      # O imóvel só deve ser reservado se ele ainda estiver disponível.
      imovel.update(status: :reservado) if imovel.disponivel?

    # Caso 2: A proposta foi recusada ou cancelada.
    elsif recusada? || cancelada?
      # Antes de mudar o imóvel, verificamos se ele NÃO tem mais NENHUMA outra proposta ativa.
      # Isso previne que o imóvel fique disponível se ainda houver outra negociação em andamento.
      if imovel.propostas.ativas.none?
        imovel.update(status: :disponivel)
      end

    # Caso 3: A proposta foi concluída (venda/aluguel finalizado)
    elsif concluida?
      imovel.update(status: :vendido) # Assumindo que a finalidade era venda
    end
  end  

  # Ao excluir uma proposta, se o imóvel estiver reservado e não houver mais propostas ativas,
  # liberamos o imóvel para disponível.
  def liberar_imovel_se_necessario
    return unless imovel.present?

    if imovel.reservado? && imovel.propostas.ativas.none?
      imovel.update(status: :disponivel)
    end
  end
end