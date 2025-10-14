# frozen_string_literal: true

class BackfillCategoriaInCaracteristicas < ActiveRecord::Migration[7.0]
  def up
    say_with_time "Backfilling categoria em caracteristicas com categoria NULL" do
      updated = 0
      enum_map = Caracteristica.defined_enums['categoria'] # ex: { 'comodos' => '0', 'infraestrutura' => '1', ... }
      Caracteristica.where(categoria: nil).find_each do |c|
        cat = categoria_por_nome(c.nome)
        next unless cat
        int_val = enum_map[cat.to_s]&.to_i
        next unless int_val
        # Atualiza sem validações/callbacks para evitar erros de unicidade já existentes
        c.update_column(:categoria, int_val)
        updated += 1
      end
      say "Registros atualizados: #{updated}", true
    end

    # Relatório pós-backfill
    totals = Caracteristica.group(:categoria).count
    say "Contagem por categoria (inteiros): #{totals.inspect}", true
    say "Sem categoria (NULL): #{Caracteristica.where(categoria: nil).count}", true
  end

  def down
    # Reverte o backfill tornando categoria nula novamente
    say_with_time "Revertendo backfill de categoria (setando NULL em todas as caracteristicas)" do
      affected = Caracteristica.update_all(categoria: nil)
      say "Registros afetados: #{affected}", true
    end
  end

  private

  def normalizar_nome(str)
    s = str.to_s.downcase.strip
    s = s.tr('áàâãä', 'a')
         .tr('éèêë', 'e')
         .tr('íìîï', 'i')
         .tr('óòôõö', 'o')
         .tr('úùûü', 'u')
         .tr('ç', 'c')
    s.gsub(/\s+/, ' ')
  end

  def categoria_por_nome(nome)
    n = normalizar_nome(nome)
    return :comodos if [
      'varanda',
      'quarto com suite',
      'suite'
    ].include?(n)

    return :posicao if [
      'vista para o mar'
    ].include?(n)

    # Conhecidas e default ambíguo => :infraestrutura
    return :infraestrutura if [
      'ar-condicionado',
      'armarios planejados',
      'mobilia',
      'mobiliado',
      'piscina',
      'academia',
      'churrasqueira',
      'salao de festas',
      'playground',
      'portaria 24h',
      'elevador',
      'area gourmet',
      'quadra',
      'garagem coberta',
      'pet friendly'
    ].include?(n)

    # Regra padrão escolhida: infraestrutura para ambíguos/desconhecidos
    :infraestrutura
  end
end