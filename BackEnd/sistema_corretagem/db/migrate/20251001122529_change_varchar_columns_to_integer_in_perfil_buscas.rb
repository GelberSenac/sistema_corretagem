# db/migrate/YYYYMMDDHHMMSS_change_varchar_columns_to_integer_in_perfil_buscas.rb
class ChangeVarcharColumnsToIntegerInPerfilBuscas < ActiveRecord::Migration[7.0] # A versão pode variar
  def up
    # --- Coluna: tipo_negocio -> finalidade ---
    # Usamos SQL puro aqui porque a conversão é complexa.
    # O CASE statement mapeia cada texto para seu número correspondente no enum.
    execute <<-SQL
      ALTER TABLE perfil_buscas
      ALTER COLUMN tipo_negocio TYPE integer USING (
        CASE tipo_negocio
          WHEN 'venda' THEN 0
          WHEN 'aluguel' THEN 1
          ELSE 0
        END
      );
    SQL
    # Renomeia a coluna para bater com o nome do enum no modelo, para maior clareza.
    rename_column :perfil_buscas, :tipo_negocio, :finalidade
    change_column_default :perfil_buscas, :finalidade, 0

    # --- Coluna: condicao_imovel -> condicao ---
    execute <<-SQL
      ALTER TABLE perfil_buscas
      ALTER COLUMN condicao_imovel TYPE integer USING (
        CASE condicao_imovel
          WHEN 'lancamento' THEN 0
          WHEN 'em_obras' THEN 1
          WHEN 'usado' THEN 2
          ELSE 2
        END
      );
    SQL
    rename_column :perfil_buscas, :condicao_imovel, :condicao
    change_column_default :perfil_buscas, :condicao, 2
  end

  def down
    # Esta seção 'down' permite que você desfaça a migração se algo der errado.

    # --- Coluna: finalidade -> tipo_negocio ---
    rename_column :perfil_buscas, :finalidade, :tipo_negocio
    execute <<-SQL
      ALTER TABLE perfil_buscas
      ALTER COLUMN tipo_negocio TYPE character varying USING (
        CASE tipo_negocio
          WHEN 0 THEN 'venda'
          WHEN 1 THEN 'aluguel'
        END
      );
    SQL
    change_column_default :perfil_buscas, :tipo_negocio, 'venda'

    # --- Coluna: condicao -> condicao_imovel ---
    rename_column :perfil_buscas, :condicao, :condicao_imovel
    execute <<-SQL
      ALTER TABLE perfil_buscas
      ALTER COLUMN condicao_imovel TYPE character varying USING (
        CASE condicao_imovel
          WHEN 0 THEN 'lancamento'
          WHEN 1 THEN 'em_obras'
          WHEN 2 THEN 'usado'
        END
      );
    SQL
    change_column_default :perfil_buscas, :condicao_imovel, 'usado'
  end
end