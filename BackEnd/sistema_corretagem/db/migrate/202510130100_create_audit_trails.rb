# db/migrate/202510130100_create_audit_trails.rb
class CreateAuditTrails < ActiveRecord::Migration[7.0]
  def change
    create_table :audit_trails do |t|
      t.references :usuario, null: true, foreign_key: true

      t.string :action, null: false
      t.string :severity, null: false, default: 'info'

      t.string :entity_type
      t.bigint :entity_id

      t.string :correlation_id
      t.string :ip
      t.string :user_agent

      t.jsonb :old_value
      t.jsonb :new_value
      t.jsonb :details

      t.timestamps
    end

    add_index :audit_trails, [:entity_type, :entity_id]
    add_index :audit_trails, :correlation_id
    add_index :audit_trails, :severity
    add_index :audit_trails, :action
    add_index :audit_trails, :created_at
  end
end