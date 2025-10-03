class CreateLancamentoFinanceiros < ActiveRecord::Migration[8.0]
  def change
    create_table :lancamento_financeiros do |t|
      t.string :descricao
      t.decimal :valor
      t.integer :tipo
      t.date :data_lancamento
      t.references :usuario, null: false, foreign_key: true
      t.references :proposta, null: false, foreign_key: true

      t.timestamps
    end
  end
end
