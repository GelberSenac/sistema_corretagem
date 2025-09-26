class FixImovelSchema < ActiveRecord::Migration[8.0]
  def change
    # Primeiro, remove a chave estrangeira errada que aponta para 'imovels'
    remove_foreign_key "propostas", "imovels"

    # Em seguida, apaga a tabela errada 'imovels'
    drop_table :imovels

    # Finalmente, adiciona a chave estrangeira correta, apontando para 'imoveis'
    add_foreign_key "propostas", "imoveis"
  end
end