class AddDemographicsToClientes < ActiveRecord::Migration[8.0]
  def change
    add_column :clientes, :nacionalidade, :string
    add_column :clientes, :data_casamento, :date
    add_column :clientes, :regime_bens, :string
  end
end
