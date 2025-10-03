class RenameRegimeDeBensToRegimeBens < ActiveRecord::Migration[8.0]
  def change
    rename_column :conjuges, :regime_de_bens, :regime_bens
  end
end
