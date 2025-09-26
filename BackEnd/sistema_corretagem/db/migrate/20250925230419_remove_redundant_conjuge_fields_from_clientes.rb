class RemoveRedundantConjugeFieldsFromClientes < ActiveRecord::Migration[8.0]
  def change
    remove_column :clientes, :nome_conjuge, :string
    remove_column :clientes, :cpf_conjuge, :string
  end
end