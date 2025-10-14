class CreatePosicoes < ActiveRecord::Migration[8.0]
  def change
    create_table :posicoes do |t|
      t.references :imovel, null: false, foreign_key: true, index: { unique: true }

      t.boolean :nascente, null: false, default: false
      t.boolean :vista_para_o_mar, null: false, default: false
      t.boolean :beira_mar, null: false, default: false
      t.boolean :poente, null: false, default: false
      t.boolean :frente_para_o_mar, null: false, default: false
      t.boolean :norte, null: false, default: false
      t.boolean :sul, null: false, default: false
      t.boolean :leste, null: false, default: false
      t.boolean :oeste, null: false, default: false

      t.timestamps
    end
  end
end