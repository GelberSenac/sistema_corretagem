class CreateUsuarios < ActiveRecord::Migration[8.0]
  def change
    create_table :usuarios do |t|
      t.string :nome
      t.string :email
      t.string :login
      t.string :senha
      t.string :cpf
      t.boolean :ativo, default: true

      t.timestamps
    end
  end
end
