class AddDataPropostaToPropostas < ActiveRecord::Migration[8.0]
  def change
    add_column :propostas, :data_proposta, :date
  end
end
