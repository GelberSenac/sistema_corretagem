# db/migrate/20251001123342_add_details_to_imoveis.rb
class AddDetailsToImoveis < ActiveRecord::Migration[8.0]
  def change
    # Mantenha apenas as colunas que NÃO existem na sua tabela.
    add_column :imoveis, :posicao_solar, :integer
    add_column :imoveis, :andar, :integer
  end
end