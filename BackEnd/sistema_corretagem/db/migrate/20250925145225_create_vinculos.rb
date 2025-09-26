class CreateVinculos < ActiveRecord::Migration[8.0]
  def change
    create_table :vinculos do |t|
      t.references :usuario, null: false, foreign_key: true
      t.references :corretora, null: false, foreign_key: true

      t.timestamps
    end
  end
end
