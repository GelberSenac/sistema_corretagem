class AddCorretoraToPropostas < ActiveRecord::Migration[8.0]
  def change
    add_reference :propostas, :corretora, null: true, foreign_key: true
  end
end
