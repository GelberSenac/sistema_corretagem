class CreateInfraestruturas < ActiveRecord::Migration[8.0]
  def change
    create_table :infraestruturas do |t|
      t.references :imovel, null: false, foreign_key: true, index: { unique: true }

      t.boolean :garagem, null: false, default: false
      t.boolean :lavanderia, null: false, default: false
      t.boolean :jardim_interno, null: false, default: false
      t.boolean :jardim_externo, null: false, default: false
      t.boolean :piscina, null: false, default: false
      t.boolean :playground, null: false, default: false
      t.boolean :portaria_24h, null: false, default: false
      t.boolean :salao_de_festas, null: false, default: false
      t.boolean :sistema_de_seguranca, null: false, default: false
      t.boolean :churrasqueira, null: false, default: false
      t.boolean :elevador, null: false, default: false
      t.boolean :sauna, null: false, default: false
      t.boolean :quadra_poliesportiva, null: false, default: false
      t.boolean :academia, null: false, default: false
      t.boolean :campo_de_futebol, null: false, default: false
      t.boolean :bicicletario, null: false, default: false
      t.boolean :area_de_lazer, null: false, default: false
      t.boolean :central_de_gas, null: false, default: false
      t.boolean :portao_eletronico, null: false, default: false
      t.boolean :gerador, null: false, default: false
      t.boolean :interfone, null: false, default: false
      t.boolean :guarita, null: false, default: false
      t.boolean :monitoramento, null: false, default: false
      t.boolean :cftv, null: false, default: false
      t.boolean :brinquedoteca, null: false, default: false
      t.boolean :salao_de_jogos, null: false, default: false
      t.boolean :spa, null: false, default: false
      t.boolean :coworking, null: false, default: false
      t.boolean :pet_place, null: false, default: false
      t.boolean :car_wash, null: false, default: false
      t.boolean :mini_mercado, null: false, default: false
      t.boolean :estacionamento_visitantes, null: false, default: false

      t.timestamps
    end
  end
end