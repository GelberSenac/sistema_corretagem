# db/migrate/....rb
class RenameRegimeBensToRegimeCasamentoInConjuges < ActiveRecord::Migration[7.0]
  def change
    rename_column :conjuges, :regime_bens, :regime_casamento
  end
end