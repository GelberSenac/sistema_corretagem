class AddUniqueIndexToImoveisCaracteristicas < ActiveRecord::Migration[8.0]
  def change
    add_index :imoveis_caracteristicas, [:imovel_id, :caracteristica_id], unique: true, name: 'idx_ic_imovel_caracteristica'
  end
end