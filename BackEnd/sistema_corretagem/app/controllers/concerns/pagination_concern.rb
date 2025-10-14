# frozen_string_literal: true

module PaginationConcern
  extend ActiveSupport::Concern

  # Retorna o número de itens por página com regras:
  # - Prioriza params[:limit] (novo padrão público)
  # - Faz fallback para params[:items] (compatibilidade)
  # - Usa Pagy::DEFAULT[:limit] como default
  # - Aplica cap máximo definido (30) e mínimo de 1
  def per_page_limit
    requested = (params[:limit].presence || params[:items].presence || Pagy::DEFAULT[:limit]).to_i
    [[requested, ::MAX_PAGE_SIZE].min, 1].max
  end
end