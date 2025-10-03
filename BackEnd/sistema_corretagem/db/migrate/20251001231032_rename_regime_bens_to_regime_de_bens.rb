class RenameRegimeBensToRegimeDeBens < ActiveRecord::Migration[8.0]
  def change
    rename_column :conjuges, :regime_casamento, :regime_de_bens
  end
end
