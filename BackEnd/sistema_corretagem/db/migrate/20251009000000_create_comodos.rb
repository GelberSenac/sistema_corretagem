class CreateComodos < ActiveRecord::Migration[8.0]
  def change
    create_table :comodos do |t|
      # Ajuste: criamos o índice único diretamente no references para evitar duplicação
      t.references :imovel, null: false, foreign_key: true, index: { unique: true }
      
      t.boolean :area_de_servico, null: false, default: false
      t.boolean :cozinha, null: false, default: false
      t.boolean :sala_de_estar, null: false, default: false
      t.boolean :sala_de_jantar, null: false, default: false
      t.boolean :suite, null: false, default: false
      t.boolean :varanda, null: false, default: false
      t.boolean :wc_social, null: false, default: false
      t.boolean :wc_de_servico, null: false, default: false
      t.boolean :despensa, null: false, default: false
      t.boolean :quarto_de_servico, null: false, default: false
      t.boolean :sala_de_visita, null: false, default: false
      t.boolean :banheiro_social, null: false, default: false
      t.boolean :lavabo, null: false, default: false
      t.boolean :escritorio, null: false, default: false
      t.boolean :home_office, null: false, default: false
      t.boolean :closet, null: false, default: false
      t.boolean :hall, null: false, default: false
      t.boolean :sala_de_tv, null: false, default: false
      t.boolean :terraco, null: false, default: false

      t.timestamps
    end

    # Removido: add_index duplicado que gerava erro PG::DuplicateTable
  end
end