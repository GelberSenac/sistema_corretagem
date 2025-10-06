# db/seeds.rb

puts "Limpando o banco de dados..."
# Esta linha apaga TODOS os registros da tabela Usuarios antes de continuar.
Usuario.destroy_all
# Você pode adicionar .destroy_all para outros modelos se quiser uma limpeza completa.
# Cliente.destroy_all
# Imovel.destroy_all
# Corretora.destroy_all
# ...etc

puts "Criando o usuário Administrador Master..."

Usuario.create!(
  nome: "Admin Master",
  email: "admin@sistema.com",
  login: "admin",
  password: "password123",
  password_confirmation: "password123",
  cpf: "529.982.247-25",
  ativo: true,
  role: :admin,
  # Criando o endereço aninhado diretamente com o usuário
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

puts "Usuário Administrador e seu endereço foram criados com sucesso!"
puts "----------------------------------------"
puts "Login: admin"
puts "Senha: password123"
puts "----------------------------------------"