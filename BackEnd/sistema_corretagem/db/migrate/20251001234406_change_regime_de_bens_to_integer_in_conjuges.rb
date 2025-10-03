# db/migrate/20251001234406_change_regime_de_bens_to_integer_in_conjuges.rb
class ChangeRegimeDeBensToIntegerInConjuges < ActiveRecord::Migration[7.0]
  def up
    # Usamos SQL puro com um CASE statement para mapear cada texto para seu número
    execute <<-SQL
      ALTER TABLE conjuges
      ALTER COLUMN regime_de_bens TYPE integer USING (
        CASE regime_de_bens
          WHEN 'comunhao_parcial' THEN 0
          WHEN 'Comunhão Parcial de Bens' THEN 0
          WHEN 'parcial de bens' THEN 0

          WHEN 'comunhao_universal' THEN 1
          WHEN 'Comunhão Universal de Bens' THEN 1

          WHEN 'separacao_total' THEN 2
          WHEN 'Separação Total de Bens' THEN 2
          ELSE 0 -- Um valor padrão para qualquer outro texto
        END
      );
    SQL
    # Define um valor padrão para novos registros
    change_column_default :conjuges, :regime_de_bens, 0
  end

  def down
    # Este método permite reverter a migração se necessário
    change_column :conjuges, :regime_de_bens, :string
    change_column_default :conjuges, :regime_de_bens, nil
  end
end