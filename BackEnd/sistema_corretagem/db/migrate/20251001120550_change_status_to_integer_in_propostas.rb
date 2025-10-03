class ChangeStatusToIntegerInPropostas < ActiveRecord::Migration[8.0]
  def change
    # Remove o valor padrão antigo que era um texto
    change_column_default :propostas, :status, nil

    # Altera a coluna 'status' para o tipo 'integer'
    # O 'USING status::integer' converte os valores existentes, se houver.
    # Se a tabela estiver vazia, você pode usar apenas :integer.
    change_column :propostas, :status, :integer, using: 'status::integer'

    # Define um novo valor padrão (0, que corresponde a :em_analise)
    change_column_default :propostas, :status, 0
  end
end
