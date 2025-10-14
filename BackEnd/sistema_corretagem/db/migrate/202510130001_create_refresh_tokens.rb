class CreateRefreshTokens < ActiveRecord::Migration[7.1]
  def change
    create_table :refresh_tokens do |t|
      t.references :usuario, null: false, foreign_key: true
      t.string :token_hash, null: false
      t.string :device_fingerprint, null: false
      t.datetime :expires_at, null: false
      t.datetime :revoked_at

      t.timestamps
    end

    add_index :refresh_tokens, :token_hash, unique: true
    add_index :refresh_tokens, :device_fingerprint
    add_index :refresh_tokens, [:usuario_id, :device_fingerprint]
    add_index :refresh_tokens, :expires_at
  end
end