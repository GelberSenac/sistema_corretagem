class CreateCorretoras < ActiveRecord::Migration[8.0]
  def change
    create_table :corretoras do |t|
      t.string :nome_fantasia
      t.string :razao_social
      t.string :cnpj
      t.string :creci_juridico

      t.timestamps
    end
  end
end
