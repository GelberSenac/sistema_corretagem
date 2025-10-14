class Agendamento < ApplicationRecord
  # Relacionamentos
  belongs_to :usuario
  belongs_to :cliente
  belongs_to :imovel

  # Validações
  validates :titulo, presence: true
  validates :data_inicio, presence: true
  validates :data_fim, presence: true
  validates :local, presence: true, length: { minimum: 3 }
  validate :data_fim_deve_ser_posterior_ao_inicio
  validate :sem_conflito_de_horarios

  # Enum para o status do agendamento
  enum :status, { agendado: 0, concluido: 1, cancelado: 2 }

  # Callbacks
  after_initialize :set_default_status, if: :new_record?

  private

  def set_default_status
    self.status ||= :agendado
  end

  def data_fim_deve_ser_posterior_ao_inicio
    return if data_inicio.blank? || data_fim.blank?
    if data_fim <= data_inicio
      errors.add(:data_fim, "deve ser posterior à data_inicio")
    end
  end

  def sem_conflito_de_horarios
    return if data_inicio.blank? || data_fim.blank? || usuario_id.blank?
    conflito = Agendamento.where(usuario_id: usuario_id)
                           .where.not(id: id)
                           .where("data_inicio < ? AND data_fim > ?", data_fim, data_inicio)
                           .exists?
    if conflito
      errors.add(:base, "Conflito de horário para este responsável")
    end
  end
end
