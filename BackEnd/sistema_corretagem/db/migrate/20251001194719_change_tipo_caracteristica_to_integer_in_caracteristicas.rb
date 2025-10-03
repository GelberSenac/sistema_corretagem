# db/migrate/....rb
class ChangeTipoCaracteristicaToIntegerInCaracteristicas < ActiveRecord::Migration[7.0]
  def change
    # Altera a coluna para integer e define um valor padrão (0 = privativa)
    change_column :caracteristicas, :tipo_caracteristica, :integer, using: 'tipo_caracteristica::integer', default: 0
  end
end