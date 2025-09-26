class AlterarCamposDeClientes < ActiveRecord::Migration[8.0]
  def change
    # Adicionando as novas colunas
    add_column :clientes, :data_nascimento, :date
    add_column :clientes, :estado_civil, :string
    add_column :clientes, :profissao, :string

    # Para campos de dinheiro, 'decimal' é o tipo correto para evitar problemas de precisão.
    # 'precision' é o total de dígitos, e 'scale' são os dígitos após a vírgula.
    add_column :clientes, :renda, :decimal, precision: 10, scale: 2    
  end
end
