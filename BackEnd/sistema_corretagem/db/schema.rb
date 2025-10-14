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

ActiveRecord::Schema[8.0].define(version: 2025_10_12_121000) do
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

  create_table "audit_trails", force: :cascade do |t|
    t.bigint "usuario_id"
    t.string "action", null: false
    t.string "severity", default: "info", null: false
    t.string "entity_type"
    t.bigint "entity_id"
    t.string "correlation_id"
    t.string "ip"
    t.string "user_agent"
    t.jsonb "old_value"
    t.jsonb "new_value"
    t.jsonb "details"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["action"], name: "index_audit_trails_on_action"
    t.index ["correlation_id"], name: "index_audit_trails_on_correlation_id"
    t.index ["created_at"], name: "index_audit_trails_on_created_at"
    t.index ["entity_type", "entity_id"], name: "index_audit_trails_on_entity_type_and_entity_id"
    t.index ["severity"], name: "index_audit_trails_on_severity"
    t.index ["usuario_id"], name: "index_audit_trails_on_usuario_id"
  end

  create_table "caracteristicas", force: :cascade do |t|
    t.string "nome"
    t.integer "tipo_caracteristica", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "categoria"
    t.index ["categoria"], name: "index_caracteristicas_on_categoria"
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
    t.string "profissao"
    t.decimal "renda", precision: 10, scale: 2
    t.string "nacionalidade"
    t.date "data_casamento"
    t.string "regime_bens"
    t.integer "estado_civil"
    t.index ["usuario_id"], name: "index_clientes_on_usuario_id"
  end

  create_table "comodos", force: :cascade do |t|
    t.bigint "imovel_id", null: false
    t.boolean "area_de_servico", default: false, null: false
    t.boolean "cozinha", default: false, null: false
    t.boolean "sala_de_estar", default: false, null: false
    t.boolean "sala_de_jantar", default: false, null: false
    t.boolean "suite", default: false, null: false
    t.boolean "varanda", default: false, null: false
    t.boolean "wc_social", default: false, null: false
    t.boolean "wc_de_servico", default: false, null: false
    t.boolean "despensa", default: false, null: false
    t.boolean "quarto_de_servico", default: false, null: false
    t.boolean "sala_de_visita", default: false, null: false
    t.boolean "banheiro_social", default: false, null: false
    t.boolean "lavabo", default: false, null: false
    t.boolean "escritorio", default: false, null: false
    t.boolean "home_office", default: false, null: false
    t.boolean "closet", default: false, null: false
    t.boolean "hall", default: false, null: false
    t.boolean "sala_de_tv", default: false, null: false
    t.boolean "terraco", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["imovel_id"], name: "index_comodos_on_imovel_id", unique: true
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
    t.integer "tipo"
    t.integer "finalidade", default: 0
    t.integer "condicao", default: 2
    t.text "descricao"
    t.integer "quartos"
    t.integer "suites"
    t.integer "banheiros"
    t.integer "vagas_garagem"
    t.decimal "metragem", precision: 8, scale: 2
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
    t.index ["imovel_id", "caracteristica_id"], name: "idx_ic_imovel_caracteristica", unique: true
    t.index ["imovel_id"], name: "index_imoveis_caracteristicas_on_imovel_id"
  end

  create_table "infraestruturas", force: :cascade do |t|
    t.bigint "imovel_id", null: false
    t.boolean "garagem", default: false, null: false
    t.boolean "lavanderia", default: false, null: false
    t.boolean "jardim_interno", default: false, null: false
    t.boolean "jardim_externo", default: false, null: false
    t.boolean "piscina", default: false, null: false
    t.boolean "playground", default: false, null: false
    t.boolean "portaria_24h", default: false, null: false
    t.boolean "salao_de_festas", default: false, null: false
    t.boolean "sistema_de_seguranca", default: false, null: false
    t.boolean "churrasqueira", default: false, null: false
    t.boolean "elevador", default: false, null: false
    t.boolean "sauna", default: false, null: false
    t.boolean "quadra_poliesportiva", default: false, null: false
    t.boolean "academia", default: false, null: false
    t.boolean "campo_de_futebol", default: false, null: false
    t.boolean "bicicletario", default: false, null: false
    t.boolean "area_de_lazer", default: false, null: false
    t.boolean "central_de_gas", default: false, null: false
    t.boolean "portao_eletronico", default: false, null: false
    t.boolean "gerador", default: false, null: false
    t.boolean "interfone", default: false, null: false
    t.boolean "guarita", default: false, null: false
    t.boolean "monitoramento", default: false, null: false
    t.boolean "cftv", default: false, null: false
    t.boolean "brinquedoteca", default: false, null: false
    t.boolean "salao_de_jogos", default: false, null: false
    t.boolean "spa", default: false, null: false
    t.boolean "coworking", default: false, null: false
    t.boolean "pet_place", default: false, null: false
    t.boolean "car_wash", default: false, null: false
    t.boolean "mini_mercado", default: false, null: false
    t.boolean "estacionamento_visitantes", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["imovel_id"], name: "index_infraestruturas_on_imovel_id", unique: true
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

  create_table "pisos", force: :cascade do |t|
    t.bigint "imovel_id", null: false
    t.boolean "porcelanato", default: false, null: false
    t.boolean "ceramica", default: false, null: false
    t.boolean "granito", default: false, null: false
    t.boolean "laminado", default: false, null: false
    t.boolean "madeira", default: false, null: false
    t.boolean "vinilico", default: false, null: false
    t.boolean "carpete", default: false, null: false
    t.boolean "ardosia", default: false, null: false
    t.boolean "marmore", default: false, null: false
    t.boolean "taco", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["imovel_id"], name: "index_pisos_on_imovel_id", unique: true
  end

  create_table "posicoes", force: :cascade do |t|
    t.bigint "imovel_id", null: false
    t.boolean "nascente", default: false, null: false
    t.boolean "vista_para_o_mar", default: false, null: false
    t.boolean "beira_mar", default: false, null: false
    t.boolean "poente", default: false, null: false
    t.boolean "frente_para_o_mar", default: false, null: false
    t.boolean "norte", default: false, null: false
    t.boolean "sul", default: false, null: false
    t.boolean "leste", default: false, null: false
    t.boolean "oeste", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["imovel_id"], name: "index_posicoes_on_imovel_id", unique: true
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
    t.bigint "perfil_busca_id"
    t.jsonb "perfil_busca_snapshot", default: {}, null: false
    t.index ["cliente_id"], name: "index_propostas_on_cliente_id"
    t.index ["corretora_id"], name: "index_propostas_on_corretora_id"
    t.index ["imovel_id"], name: "index_propostas_on_imovel_id"
    t.index ["perfil_busca_id"], name: "index_propostas_on_perfil_busca_id"
    t.index ["usuario_id"], name: "index_propostas_on_usuario_id"
  end

  create_table "proximidades", force: :cascade do |t|
    t.bigint "imovel_id", null: false
    t.boolean "bares_e_restaurantes", default: false, null: false
    t.boolean "escola", default: false, null: false
    t.boolean "faculdade", default: false, null: false
    t.boolean "farmacia", default: false, null: false
    t.boolean "hospital", default: false, null: false
    t.boolean "padaria", default: false, null: false
    t.boolean "pet_shop", default: false, null: false
    t.boolean "shopping_center", default: false, null: false
    t.boolean "supermercado", default: false, null: false
    t.boolean "banco", default: false, null: false
    t.boolean "shopping", default: false, null: false
    t.boolean "praia", default: false, null: false
    t.boolean "parque", default: false, null: false
    t.boolean "metro", default: false, null: false
    t.boolean "estacao_de_metro", default: false, null: false
    t.boolean "estacao", default: false, null: false
    t.boolean "ponto_de_onibus", default: false, null: false
    t.boolean "terminal", default: false, null: false
    t.boolean "igreja", default: false, null: false
    t.boolean "feira", default: false, null: false
    t.boolean "mercado", default: false, null: false
    t.boolean "posto_de_gasolina", default: false, null: false
    t.boolean "delegacia", default: false, null: false
    t.boolean "correios", default: false, null: false
    t.boolean "loterica", default: false, null: false
    t.boolean "universidade", default: false, null: false
    t.boolean "creche", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["imovel_id"], name: "index_proximidades_on_imovel_id", unique: true
  end

  create_table "refresh_tokens", force: :cascade do |t|
    t.bigint "usuario_id", null: false
    t.string "token_hash", null: false
    t.string "device_fingerprint", null: false
    t.datetime "expires_at", null: false
    t.datetime "revoked_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["device_fingerprint"], name: "index_refresh_tokens_on_device_fingerprint"
    t.index ["expires_at"], name: "index_refresh_tokens_on_expires_at"
    t.index ["token_hash"], name: "index_refresh_tokens_on_token_hash", unique: true
    t.index ["usuario_id", "device_fingerprint"], name: "index_refresh_tokens_on_usuario_id_and_device_fingerprint"
    t.index ["usuario_id"], name: "index_refresh_tokens_on_usuario_id"
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
  add_foreign_key "audit_trails", "usuarios"
  add_foreign_key "clientes", "usuarios"
  add_foreign_key "comodos", "imoveis"
  add_foreign_key "conjuges", "clientes"
  add_foreign_key "imoveis", "usuarios"
  add_foreign_key "imoveis_caracteristicas", "caracteristicas"
  add_foreign_key "imoveis_caracteristicas", "imoveis"
  add_foreign_key "infraestruturas", "imoveis"
  add_foreign_key "lancamento_financeiros", "propostas"
  add_foreign_key "lancamento_financeiros", "usuarios"
  add_foreign_key "perfil_buscas", "clientes"
  add_foreign_key "perfil_corretors", "usuarios"
  add_foreign_key "pisos", "imoveis"
  add_foreign_key "posicoes", "imoveis"
  add_foreign_key "propostas", "clientes"
  add_foreign_key "propostas", "corretoras"
  add_foreign_key "propostas", "imoveis"
  add_foreign_key "propostas", "perfil_buscas"
  add_foreign_key "propostas", "usuarios"
  add_foreign_key "proximidades", "imoveis"
  add_foreign_key "refresh_tokens", "usuarios"
  add_foreign_key "vinculos", "corretoras"
  add_foreign_key "vinculos", "usuarios"
end
