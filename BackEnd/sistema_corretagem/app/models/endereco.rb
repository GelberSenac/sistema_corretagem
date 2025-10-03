class Endereco < ApplicationRecord
  # --- Callback ---
  before_validation :normalize_cep

  # --- Associações ---
  belongs_to :enderecoable, polymorphic: true 

  #--- Enums ---
    enum :estado, {
    AC: 'AC', AL: 'AL', AP: 'AP', AM: 'AM', BA: 'BA', CE: 'CE', DF: 'DF',
    ES: 'ES', GO: 'GO', MA: 'MA', MT: 'MT', MS: 'MS', MG: 'MG', PA: 'PA',
    PB: 'PB', PR: 'PR', PE: 'PE', PI: 'PI', RJ: 'RJ', RN: 'RN', RS: 'RS',
    RO: 'RO', RR: 'RR', SC: 'SC', SP: 'SP', SE: 'SE', TO: 'TO'
  }

  # --- Validações ---
  validates :logradouro, presence: true, length: { maximum: 150 } 
  validates :numero, presence: true, length: { maximum: 10 } 
  validates :complemento, length: { maximum: 50 }, allow_blank: true 
  validates :bairro, presence: true, length: { maximum: 100 } 
  validates :cidade, presence: true, length: { maximum: 100 } 
  validates :estado, presence: true # A validação de length não é mais necessária
  
  # Validação do CEP alterada
  validates :cep, presence: true, length: { is: 8 }, numericality: { only_integer: true } 
  
  private

  # --- Método Privado para Limpar o CEP ---
  def normalize_cep
    self.cep = cep.gsub(/\D/, '') if cep
  end
end