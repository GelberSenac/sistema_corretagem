class AddCategoriaToCaracteristicas < ActiveRecord::Migration[8.0]
  def change
    add_column :caracteristicas, :categoria, :integer
    add_index :caracteristicas, :categoria
  end
end