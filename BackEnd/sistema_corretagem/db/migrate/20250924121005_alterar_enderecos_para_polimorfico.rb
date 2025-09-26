class AlterarEnderecosParaPolimorfico < ActiveRecord::Migration[8.0]
  def change
    # Remove a antiga coluna de associação direta
    remove_reference :enderecos, :usuario, foreign_key: true, index: true
    
    # Adiciona as novas colunas para a associação polimórfica
    # 'references' cria as colunas 'enderecoable_id' e 'enderecoable_type'
    add_reference :enderecos, :enderecoable, polymorphic: true, null: false, index: true
  end
end
