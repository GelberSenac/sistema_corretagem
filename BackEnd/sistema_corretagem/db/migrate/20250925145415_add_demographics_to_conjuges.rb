class AddDemographicsToConjuges < ActiveRecord::Migration[8.0]
  def change
    add_column :conjuges, :nacionalidade, :string
    add_column :conjuges, :data_casamento, :date
    add_column :conjuges, :regime_bens, :string
  end
end
