class CreatePisos < ActiveRecord::Migration[8.0]
  def change
    create_table :pisos do |t|
      t.references :imovel, null: false, foreign_key: true, index: { unique: true }

      t.boolean :porcelanato, null: false, default: false
      t.boolean :ceramica, null: false, default: false
      t.boolean :granito, null: false, default: false
      t.boolean :laminado, null: false, default: false
      t.boolean :madeira, null: false, default: false
      t.boolean :vinilico, null: false, default: false
      t.boolean :carpete, null: false, default: false
      t.boolean :ardosia, null: false, default: false
      t.boolean :marmore, null: false, default: false
      t.boolean :taco, null: false, default: false

      t.timestamps
    end
  end
end