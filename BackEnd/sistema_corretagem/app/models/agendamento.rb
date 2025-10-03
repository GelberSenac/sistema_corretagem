class Agendamento < ApplicationRecord
  # Relacionamentos
  belongs_to :usuario
  belongs_to :cliente
  belongs_to :imovel

  # Validações
  validates :titulo, presence: true
  validates :data_inicio, presence: true
  validates :data_fim, presence: true

  # Enum para o status do agendamento
  enum status: { agendado: 0, concluido: 1, cancelado: 2 }

  # Callbacks
  after_initialize :set_default_status, if: :new_record?

  private

  def set_default_status
    self.status ||= :agendado
  end
end
