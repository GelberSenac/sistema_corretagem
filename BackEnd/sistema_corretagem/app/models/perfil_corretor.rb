class PerfilCorretor < ApplicationRecord
  belongs_to :usuario
  
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
end
