# db/seeds.rb

# Seeds idempotentes: NÃO apagamos dados em massa.
# Em vez disso, garantimos a existência/atualização do Admin Master.
puts "Preparando seeds idempotentes..."

admin_email = ENV.fetch('ADMIN_EMAIL', 'admin@sistema.com')
admin_login = ENV.fetch('ADMIN_LOGIN', 'admin')
admin_password = ENV.fetch('ADMIN_PASSWORD', 'password123')

# Busca robusta por usuário existente (por login OU email) para evitar duplicidade.
admin_usuario = Usuario.find_by(login: admin_login) || Usuario.find_by(email: admin_email) || Usuario.new

# Atribuições sempre atualizadas (mantêm dados coerentes ao longo do tempo)
admin_usuario.assign_attributes(
  nome: "Admin Master",
  email: admin_email,
  login: admin_login,
  password: admin_password,
  password_confirmation: admin_password,
  cpf: "529.982.247-25",
  ativo: true,
  role: :admin,
  endereco_attributes: {
    logradouro: "Rua Principal do Sistema",
    numero: "123",
    complemento: "Sala 101",
    bairro: "Centro",
    cidade: "Sua Cidade",
    estado: "PE",
    cep: "50000-000"
  }
)

admin_usuario.save!

puts "Usuário Administrador garantido/atualizado com sucesso!"
puts "----------------------------------------"
puts "Login: #{admin_login}"
puts "Senha: (definida via variável de ambiente)"
puts "----------------------------------------"

# Catálogo de características permanece fora dos seeds conforme orientação.
# Nenhuma característica padrão será criada pelo seeds.