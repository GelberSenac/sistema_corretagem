class AddConjugeToClientes < ActiveRecord::Migration[8.0]
  def change
    add_column :clientes, :nome_conjuge, :string
    add_column :clientes, :cpf_conjuge, :string
  end
end
