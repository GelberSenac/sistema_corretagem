class CreateImoveisCaracteristicas < ActiveRecord::Migration[8.0]
  def change
    create_table :imoveis_caracteristicas do |t|
      t.references :imovel, null: false, foreign_key: true
      t.references :caracteristica, null: false, foreign_key: true

      t.timestamps
    end
  end
end
