class DropPostsTable < ActiveRecord::Migration[8.0]
  def change
    drop_table :posts
  end
end
