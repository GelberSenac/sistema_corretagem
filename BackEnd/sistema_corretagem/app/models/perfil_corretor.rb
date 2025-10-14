class PerfilCorretor < ApplicationRecord
  belongs_to :usuario
  
  # --- Callbacks ---
  before_validation :normalize_creci_estado

  # Delega os métodos :nome e :email para a associação :usuario.
  delegate :nome, :email, to: :usuario, prefix: false
    
  #--- Enums ---
    enum :creci_estado, {
    AC: 'AC', AL: 'AL', AP: 'AP', AM: 'AM', BA: 'BA', CE: 'CE', DF: 'DF',
    ES: 'ES', GO: 'GO', MA: 'MA', MT: 'MT', MS: 'MS', MG: 'MG', PA: 'PA',
    PB: 'PB', PR: 'PR', PE: 'PE', PI: 'PI', RJ: 'RJ', RN: 'RN', RS: 'RS',
    RO: 'RO', RR: 'RR', SC: 'SC', SP: 'SP', SE: 'SE', TO: 'TO'
  }

  # --- Validações ---
  validates :creci, presence: true, uniqueness: true
  validates :creci_estado, presence: true 

  def creci_estado=(value)
    super(value.nil? ? nil : value.to_s.strip.upcase)
  end

  private

  def normalize_creci_estado
    self.creci_estado = creci_estado.to_s.strip.upcase if creci_estado.present?
  end
end
