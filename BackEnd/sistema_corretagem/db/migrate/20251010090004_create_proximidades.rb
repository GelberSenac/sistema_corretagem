class CreateProximidades < ActiveRecord::Migration[8.0]
  def change
    create_table :proximidades do |t|
      t.references :imovel, null: false, foreign_key: true, index: { unique: true }

      t.boolean :bares_e_restaurantes, null: false, default: false
      t.boolean :escola, null: false, default: false
      t.boolean :faculdade, null: false, default: false
      t.boolean :farmacia, null: false, default: false
      t.boolean :hospital, null: false, default: false
      t.boolean :padaria, null: false, default: false
      t.boolean :pet_shop, null: false, default: false
      t.boolean :shopping_center, null: false, default: false
      t.boolean :supermercado, null: false, default: false
      t.boolean :banco, null: false, default: false
      t.boolean :shopping, null: false, default: false
      t.boolean :praia, null: false, default: false
      t.boolean :parque, null: false, default: false
      t.boolean :metro, null: false, default: false
      t.boolean :estacao_de_metro, null: false, default: false
      t.boolean :estacao, null: false, default: false
      t.boolean :ponto_de_onibus, null: false, default: false
      t.boolean :terminal, null: false, default: false
      t.boolean :igreja, null: false, default: false
      t.boolean :feira, null: false, default: false
      t.boolean :mercado, null: false, default: false
      t.boolean :posto_de_gasolina, null: false, default: false
      t.boolean :delegacia, null: false, default: false
      t.boolean :correios, null: false, default: false
      t.boolean :loterica, null: false, default: false
      t.boolean :universidade, null: false, default: false
      t.boolean :creche, null: false, default: false

      t.timestamps
    end
  end
end