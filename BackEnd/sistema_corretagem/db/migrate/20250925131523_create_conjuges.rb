class CreateConjuges < ActiveRecord::Migration[8.0]
  def change
    create_table :conjuges do |t|
      t.string :nome
      t.date :data_nascimento
      t.string :cpf
      t.string :rg
      t.string :profissao
      t.decimal :renda, precision: 10, scale: 2
      t.string :email
      t.string :celular
      t.references :cliente, null: false, foreign_key: true

      t.timestamps
    end
  end
end
