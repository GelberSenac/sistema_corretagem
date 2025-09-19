class CreateEnderecos < ActiveRecord::Migration[8.0]
  def change
    create_table :enderecos do |t|
      t.string :logradouro
      t.string :numero
      t.string :complemento
      t.string :bairro
      t.string :cidade
      t.string :estado
      t.string :cep
      t.boolean :ativo, default: true

      t.timestamps
    end
  end
end
