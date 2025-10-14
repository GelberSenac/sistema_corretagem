# lib/tasks/caracteristicas.rake
namespace :caracteristicas do
  desc "Relatório pós-backfill: contagem por categoria e itens sem categoria"
  task report: :environment do
    inv = Caracteristica.defined_enums['categoria'].transform_values(&:to_i).invert
    counts = Caracteristica.group(:categoria).count
    puts "=== Relatório pós-backfill de Caracteristicas ==="
    counts.each do |k, v|
      cat = inv[k] || (k.nil? ? 'nil' : k.to_s)
      puts "  #{cat}: #{v}"
    end
    nils = Caracteristica.where(categoria: nil).pluck(:id, :nome)
    puts "Itens sem categoria: #{nils.length}"
    nils.each do |id, n|
      puts "  ##{id} - #{n}"
    end
  end
end