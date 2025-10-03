class AddCoastalFieldsToEnderecos < ActiveRecord::Migration[8.0]
  def change
    add_column :enderecos, :frente_mar, :boolean
    add_column :enderecos, :quadra_mar, :boolean
  end
end
