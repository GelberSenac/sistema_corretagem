class AddPerfilBuscaSnapshotToPropostas < ActiveRecord::Migration[8.0]
  def change
    add_reference :propostas, :perfil_busca, foreign_key: true, null: true
    add_column :propostas, :perfil_busca_snapshot, :jsonb, default: {}, null: false
  end
end