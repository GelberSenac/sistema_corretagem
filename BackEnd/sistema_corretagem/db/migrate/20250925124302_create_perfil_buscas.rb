class CreatePerfilBuscas < ActiveRecord::Migration[8.0]
  def change
    create_table :perfil_buscas do |t|
      t.string :titulo_busca
      t.string :tipo_negocio
      t.string :condicao_imovel
      t.string :bairro_preferencia
      t.decimal :valor_maximo_imovel, precision: 12, scale: 2
      t.decimal :valor_entrada_disponivel, precision: 12, scale: 2
      t.decimal :renda_minima_exigida, precision: 10, scale: 2
      t.integer :quartos_minimo
      t.integer :suites_minimo
      t.integer :banheiros_minimo
      t.integer :vagas_minimo
      t.integer :metragem_minima
      t.boolean :exige_varanda
      t.references :cliente, null: false, foreign_key: true

      t.timestamps
    end
  end
end
