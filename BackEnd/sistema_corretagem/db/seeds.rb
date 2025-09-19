puts "Criando usuários..."
Usuario.create!(nome: "Admin", email: "admin@email.com", login: "admin01", senha: "password", cpf: "123.456.789-00", ativo: true)
puts "Usuários criados!"

#puts "Criando endereço..."
#Endereco.create!(logradouro: "Rua Exemplo", numero: "123", complemento: "Apto 45", bairro: "Centro", cidade: "Cidade Exemplo", estado: "EX", cep: "12345-678")
#puts "Endereço criados!"