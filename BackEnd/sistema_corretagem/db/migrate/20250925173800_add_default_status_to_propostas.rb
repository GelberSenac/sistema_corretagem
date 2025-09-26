class AddDefaultStatusToPropostas < ActiveRecord::Migration[8.0]
  def change
    # Define 'em_analise' como o status padrão para toda nova proposta
    change_column_default :propostas, :status, from: nil, to: 'em_analise'
  end
end
