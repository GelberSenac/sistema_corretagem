# frozen_string_literal: true

require 'pagy/extras/headers'
require 'pagy/extras/overflow'

# Compatibilidade com Pagy v9+: usa :limit como número de itens por página.
# Mantemos também :items como alias para compatibilidade com testes existentes.
# Fonte: ENV['PAGY_ITEMS'] e cap de 30 por segurança/performance.
DEFAULT_PAGE_SIZE = ENV.fetch('PAGY_ITEMS', 20).to_i
MAX_PAGE_SIZE = 30

Pagy::DEFAULT[:limit] = [[DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE].min, 1].max
Pagy::DEFAULT[:items] = Pagy::DEFAULT[:limit]
Pagy::DEFAULT[:overflow] = :empty_page

# Boa prática de segurança para evitar modificações acidentais.
Pagy::DEFAULT[:freeze] = true