class AddUsuarioRefToClientes < ActiveRecord::Migration[8.0]
  def change
    add_reference :clientes, :usuario, null: false, foreign_key: true
  end
end
