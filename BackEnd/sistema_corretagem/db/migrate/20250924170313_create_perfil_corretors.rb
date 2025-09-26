class CreatePerfilCorretors < ActiveRecord::Migration[8.0]
  def change
    create_table :perfil_corretors do |t|
      t.string :creci
      t.string :creci_estado
      t.references :usuario, null: false, foreign_key: true

      t.timestamps
    end
  end
end
