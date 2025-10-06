# db/migrate/20251006120000_change_string_enums_to_integer_in_imoveis.rb
class ChangeStringEnumsToIntegerInImoveis < ActiveRecord::Migration[8.0]
  def up
    # Converter coluna :tipo de string para integer conforme enum do modelo
    execute <<-SQL
      ALTER TABLE imoveis
      ALTER COLUMN tipo TYPE integer USING (
        CASE tipo
          WHEN 'apartamento' THEN 0
          WHEN 'casa' THEN 1
          WHEN 'flat' THEN 2
          WHEN 'cobertura' THEN 3
          WHEN 'kitnet' THEN 4
          WHEN 'terreno' THEN 5
          WHEN '0' THEN 0
          WHEN '1' THEN 1
          WHEN '2' THEN 2
          WHEN '3' THEN 3
          WHEN '4' THEN 4
          WHEN '5' THEN 5
          ELSE 0
        END
      );
    SQL

    # Converter coluna :finalidade de string para integer conforme enum do modelo
    execute <<-SQL
      ALTER TABLE imoveis
      ALTER COLUMN finalidade TYPE integer USING (
        CASE finalidade
          WHEN 'venda' THEN 0
          WHEN 'aluguel' THEN 1
          WHEN '0' THEN 0
          WHEN '1' THEN 1
          ELSE 0
        END
      );
    SQL
    change_column_default :imoveis, :finalidade, 0

    # Converter coluna :condicao de string para integer conforme enum do modelo
    execute <<-SQL
      ALTER TABLE imoveis
      ALTER COLUMN condicao TYPE integer USING (
        CASE condicao
          WHEN 'lancamento' THEN 0
          WHEN 'em_obras' THEN 1
          WHEN 'usado' THEN 2
          WHEN '0' THEN 0
          WHEN '1' THEN 1
          WHEN '2' THEN 2
          ELSE 2
        END
      );
    SQL
    change_column_default :imoveis, :condicao, 2
  end

  def down
    change_column :imoveis, :tipo, :string
    change_column :imoveis, :finalidade, :string
    change_column :imoveis, :condicao, :string
    change_column_default :imoveis, :finalidade, nil
    change_column_default :imoveis, :condicao, nil
  end
end