class ChangeBairroPreferenciaToTextInPerfilBuscas < ActiveRecord::Migration[8.0]
  def change
    change_column :perfil_buscas, :bairro_preferencia, :text
  end
end
