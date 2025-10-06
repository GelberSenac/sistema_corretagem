class ConvertEstadoCivilToInteger < ActiveRecord::Migration[8.0]
  def up
    # Adiciona coluna temporária integer
    add_column :clientes, :estado_civil_tmp, :integer

    # Copia os valores de string para integer conforme o mapeamento do enum
    execute <<-SQL
      UPDATE clientes
      SET estado_civil_tmp = CASE estado_civil
        WHEN 'solteiro' THEN 0
        WHEN 'casado' THEN 1
        WHEN 'divorciado' THEN 2
        WHEN 'viuvo' THEN 3
        WHEN 'uniao_estavel' THEN 4
        ELSE 0
      END;
    SQL

    # Remove a coluna antiga e renomeia a temporária
    remove_column :clientes, :estado_civil, :string
    rename_column :clientes, :estado_civil_tmp, :estado_civil
  end

  def down
    # Reverte para string
    add_column :clientes, :estado_civil_tmp, :string

    # Copia os valores integer para string conforme o mapeamento
    execute <<-SQL
      UPDATE clientes
      SET estado_civil_tmp = CASE estado_civil
        WHEN 0 THEN 'solteiro'
        WHEN 1 THEN 'casado'
        WHEN 2 THEN 'divorciado'
        WHEN 3 THEN 'viuvo'
        WHEN 4 THEN 'uniao_estavel'
        ELSE NULL
      END;
    SQL

    remove_column :clientes, :estado_civil, :integer
    rename_column :clientes, :estado_civil_tmp, :estado_civil
  end
end