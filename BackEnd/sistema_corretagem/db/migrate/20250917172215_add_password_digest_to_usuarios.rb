# db/migrate/2025..._add_password_digest_to_usuarios.rb

class AddPasswordDigestToUsuarios < ActiveRecord::Migration[7.1]
  def change
    # Remove a coluna 'senha' em texto puro
    remove_column :usuarios, :senha, :string
    
    # Adiciona a coluna 'password_digest'
    add_column :usuarios, :password_digest, :string
  end
end