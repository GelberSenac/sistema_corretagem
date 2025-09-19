class AddUsuarioIdToEnderecos < ActiveRecord::Migration[8.0]
  def change
    add_reference :enderecos, :usuario, null: false, foreign_key: true
  end
end
