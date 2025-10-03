class CreateCaracteristicas < ActiveRecord::Migration[8.0]
  def change
    create_table :caracteristicas do |t|
      t.string :nome
      t.string :tipo_caracteristica

      t.timestamps
    end
  end
end
