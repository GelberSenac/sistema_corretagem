class CreatePropostas < ActiveRecord::Migration[8.0]
  def change
    create_table :propostas do |t|
      t.decimal :valor_proposta, precision: 12, scale: 2
      t.jsonb :condicoes_pagamento
      t.string :status
      t.references :usuario, null: false, foreign_key: true
      t.references :cliente, null: false, foreign_key: true
      t.references :imovel, null: false, foreign_key: true

      t.timestamps
    end
  end
end
