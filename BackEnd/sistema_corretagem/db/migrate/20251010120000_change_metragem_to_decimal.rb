class ChangeMetragemToDecimal < ActiveRecord::Migration[8.0]
  def up
    change_column :imoveis, :metragem, :decimal, precision: 8, scale: 2
  end

  def down
    change_column :imoveis, :metragem, :integer
  end
end