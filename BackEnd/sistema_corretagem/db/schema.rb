# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_10_02_143852) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "agendamentos", force: :cascade do |t|
    t.string "titulo"
    t.text "descricao"
    t.datetime "data_inicio"
    t.datetime "data_fim"
    t.string "local"
    t.integer "status"
    t.bigint "usuario_id", null: false
    t.bigint "cliente_id", null: false
    t.bigint "imovel_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["cliente_id"], name: "index_agendamentos_on_cliente_id"
    t.index ["imovel_id"], name: "index_agendamentos_on_imovel_id"
    t.index ["usuario_id"], name: "index_agendamentos_on_usuario_id"
  end

  create_table "caracteristicas", force: :cascade do |t|
    t.string "nome"
    t.integer "tipo_caracteristica", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "clientes", force: :cascade do |t|
    t.string "nome"
    t.string "rg"
    t.string "cpf"
    t.string "sexo"
    t.string "email"
    t.string "telefone"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "usuario_id", null: false
    t.date "data_nascimento"
    t.string "estado_civil"
    t.string "profissao"
    t.decimal "renda", precision: 10, scale: 2
    t.string "nacionalidade"
    t.date "data_casamento"
    t.string "regime_bens"
    t.index ["usuario_id"], name: "index_clientes_on_usuario_id"
  end

  create_table "conjuges", force: :cascade do |t|
    t.string "nome"
    t.date "data_nascimento"
    t.string "cpf"
    t.string "rg"
    t.string "profissao"
    t.decimal "renda", precision: 10, scale: 2
    t.string "email"
    t.string "celular"
    t.bigint "cliente_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "nacionalidade"
    t.date "data_casamento"
    t.integer "regime_bens", default: 0
    t.index ["cliente_id"], name: "index_conjuges_on_cliente_id"
  end

  create_table "corretoras", force: :cascade do |t|
    t.string "nome_fantasia"
    t.string "razao_social"
    t.string "cnpj"
    t.string "creci_juridico"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "enderecos", force: :cascade do |t|
    t.string "logradouro"
    t.string "numero"
    t.string "complemento"
    t.string "bairro"
    t.string "cidade"
    t.string "estado"
    t.string "cep"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "enderecoable_type", null: false
    t.bigint "enderecoable_id", null: false
    t.boolean "frente_mar"
    t.boolean "quadra_mar"
    t.index ["enderecoable_type", "enderecoable_id"], name: "index_enderecos_on_enderecoable"
  end

  create_table "imoveis", force: :cascade do |t|
    t.string "nome_empreendimento"
    t.string "tipo"
    t.string "finalidade"
    t.string "condicao"
    t.text "descricao"
    t.integer "quartos"
    t.integer "suites"
    t.integer "banheiros"
    t.integer "vagas_garagem"
    t.integer "metragem"
    t.integer "ano_construcao"
    t.integer "unidades_por_andar"
    t.integer "numero_torres"
    t.integer "andares"
    t.integer "elevadores"
    t.integer "varandas"
    t.decimal "valor", precision: 12, scale: 2
    t.decimal "valor_condominio", precision: 10, scale: 2
    t.decimal "valor_iptu", precision: 10, scale: 2
    t.text "comodidades", default: [], array: true
    t.integer "status", default: 0
    t.bigint "usuario_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "posicao_solar"
    t.integer "andar"
    t.index ["usuario_id"], name: "index_imoveis_on_usuario_id"
  end

  create_table "imoveis_caracteristicas", force: :cascade do |t|
    t.bigint "imovel_id", null: false
    t.bigint "caracteristica_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["caracteristica_id"], name: "index_imoveis_caracteristicas_on_caracteristica_id"
    t.index ["imovel_id"], name: "index_imoveis_caracteristicas_on_imovel_id"
  end

  create_table "lancamento_financeiros", force: :cascade do |t|
    t.string "descricao"
    t.decimal "valor"
    t.integer "tipo"
    t.date "data_lancamento"
    t.bigint "usuario_id", null: false
    t.bigint "proposta_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["proposta_id"], name: "index_lancamento_financeiros_on_proposta_id"
    t.index ["usuario_id"], name: "index_lancamento_financeiros_on_usuario_id"
  end

  create_table "perfil_buscas", force: :cascade do |t|
    t.string "titulo_busca"
    t.integer "finalidade", default: 0
    t.integer "condicao", default: 2
    t.text "bairro_preferencia"
    t.decimal "valor_maximo_imovel", precision: 12, scale: 2
    t.decimal "valor_entrada_disponivel", precision: 12, scale: 2
    t.decimal "renda_minima_exigida", precision: 10, scale: 2
    t.integer "quartos_minimo"
    t.integer "suites_minimo"
    t.integer "banheiros_minimo"
    t.integer "vagas_minimo"
    t.integer "metragem_minima"
    t.boolean "exige_varanda"
    t.bigint "cliente_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["cliente_id"], name: "index_perfil_buscas_on_cliente_id"
  end

  create_table "perfil_corretors", force: :cascade do |t|
    t.string "creci"
    t.string "creci_estado"
    t.bigint "usuario_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["usuario_id"], name: "index_perfil_corretors_on_usuario_id"
  end

  create_table "propostas", force: :cascade do |t|
    t.decimal "valor_proposta", precision: 12, scale: 2
    t.jsonb "condicoes_pagamento"
    t.integer "status", default: 0
    t.bigint "usuario_id", null: false
    t.bigint "cliente_id", null: false
    t.bigint "imovel_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "corretora_id"
    t.date "data_proposta"
    t.index ["cliente_id"], name: "index_propostas_on_cliente_id"
    t.index ["corretora_id"], name: "index_propostas_on_corretora_id"
    t.index ["imovel_id"], name: "index_propostas_on_imovel_id"
    t.index ["usuario_id"], name: "index_propostas_on_usuario_id"
  end

  create_table "usuarios", force: :cascade do |t|
    t.string "nome"
    t.string "email"
    t.string "login"
    t.string "cpf"
    t.boolean "ativo"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "password_digest"
    t.integer "role"
  end

  create_table "vinculos", force: :cascade do |t|
    t.bigint "usuario_id", null: false
    t.bigint "corretora_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["corretora_id"], name: "index_vinculos_on_corretora_id"
    t.index ["usuario_id"], name: "index_vinculos_on_usuario_id"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "agendamentos", "clientes"
  add_foreign_key "agendamentos", "imoveis"
  add_foreign_key "agendamentos", "usuarios"
  add_foreign_key "clientes", "usuarios"
  add_foreign_key "conjuges", "clientes"
  add_foreign_key "imoveis", "usuarios"
  add_foreign_key "imoveis_caracteristicas", "caracteristicas"
  add_foreign_key "imoveis_caracteristicas", "imoveis"
  add_foreign_key "lancamento_financeiros", "propostas"
  add_foreign_key "lancamento_financeiros", "usuarios"
  add_foreign_key "perfil_buscas", "clientes"
  add_foreign_key "perfil_corretors", "usuarios"
  add_foreign_key "propostas", "clientes"
  add_foreign_key "propostas", "corretoras"
  add_foreign_key "propostas", "imoveis"
  add_foreign_key "propostas", "usuarios"
  add_foreign_key "vinculos", "corretoras"
  add_foreign_key "vinculos", "usuarios"
end
