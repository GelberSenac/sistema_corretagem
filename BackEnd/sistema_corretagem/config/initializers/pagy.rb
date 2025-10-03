# config/initializers/pagy.rb

# Carrega a extensão 'headers', que é o que precisamos para a API.
# O 'backend' é carregado automaticamente quando você usa 'include Pagy::Backend' no controller,
# então não precisamos mais chamá-lo aqui.
require 'pagy/extras/headers'

# Define um número padrão de itens por página para todo o sistema.
Pagy::DEFAULT[:items] = 15

# Boa prática de segurança para evitar modificações acidentais.
Pagy::DEFAULT[:freeze] = true