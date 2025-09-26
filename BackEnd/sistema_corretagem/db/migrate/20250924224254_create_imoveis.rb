class CreateImoveis < ActiveRecord::Migration[8.0]
  def change
    create_table :imoveis do |t|
      t.string :nome_empreendimento
      t.string :tipo
      t.string :finalidade
      t.string :condicao
      t.text :descricao
      t.integer :quartos
      t.integer :suites
      t.integer :banheiros
      t.integer :vagas_garagem
      t.integer :metragem
      t.integer :ano_construcao
      t.integer :unidades_por_andar
      t.integer :numero_torres
      t.integer :andares
      t.integer :elevadores
      t.integer :varandas
      t.decimal :valor, precision: 12, scale: 2
      t.decimal :valor_condominio, precision: 10, scale: 2
      t.decimal :valor_iptu, precision: 10, scale: 2
      t.text "comodidades", array: true, default: []

      t.timestamps
    end
  end
end
