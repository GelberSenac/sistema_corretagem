class CreateAgendamentos < ActiveRecord::Migration[8.0]
  def change
    create_table :agendamentos do |t|
      t.string :titulo
      t.text :descricao
      t.datetime :data_inicio
      t.datetime :data_fim
      t.string :local
      t.integer :status
      t.references :usuario, null: false, foreign_key: true
      t.references :cliente, null: false, foreign_key: true
      t.references :imovel, null: false, foreign_key: true

      t.timestamps
    end
  end
end
