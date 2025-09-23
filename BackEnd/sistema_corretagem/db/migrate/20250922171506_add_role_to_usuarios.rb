class AddRoleToUsuarios < ActiveRecord::Migration[8.0]
  def change
    add_column :usuarios, :role, :integer
  end
end
