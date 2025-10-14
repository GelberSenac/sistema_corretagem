# lib/tasks/catalogo.rake
# Tarefas para provisionar catálogo controlado de Caracteristicas
# Uso:
#   bundle exec rake catalogo:caracteristicas:seed   # cria/atualiza catálogo idempotente
#   bundle exec rake catalogo:caracteristicas:purge  # remove catálogo criado por seed

namespace :catalogo do
  namespace :caracteristicas do
    desc 'Seed catálogo de características (idempotente)'
    task seed: :environment do
      data = {
        comodos: [
          'Quarto', 'Sala de Estar', 'Sala de Jantar', 'Suíte', 'Varanda',
          'Banheiro Social', 'Lavabo', 'Cozinha', 'Escritório', 'Área de Serviço'
        ],
        infraestrutura: [
          'Elevador', 'Portaria 24h', 'Piscina', 'Academia', 'Salão de Festas',
          'Playground', 'Churrasqueira', 'Quadra', 'Gerador'
        ],
        piso: [
          'Cerâmica', 'Porcelanato', 'Laminado', 'Vinílico', 'Carpete', 'Madeira'
        ],
        posicao: [
          'Nascente', 'Poente', 'Frente', 'Fundos', 'Vista Mar', 'Vista Cidade'
        ],
        proximidades: [
          'Supermercado', 'Escola', 'Universidade', 'Parque', 'Praia',
          'Hospital', 'Farmácia', 'Transporte Público'
        ]
      }

      tipo_padrao = :comum

      total_criados = 0
      total_existentes = 0

      Caracteristica.transaction do
        data.each do |categoria, nomes|
          nomes.each do |nome|
            registro = Caracteristica.find_or_initialize_by(nome: nome, tipo_caracteristica: tipo_padrao)
            registro.categoria = categoria

            if registro.new_record?
              registro.save!
              total_criados += 1
              puts "[CRIADO] #{registro.nome} (categoria: #{categoria}, tipo: #{tipo_padrao})"
            else
              if registro.changed?
                registro.save!
                puts "[ATUALIZADO] #{registro.nome} (categoria: #{categoria}, tipo: #{tipo_padrao})"
              else
                puts "[EXISTENTE] #{registro.nome} (categoria: #{categoria}, tipo: #{tipo_padrao})"
              end
              total_existentes += 1
            end
          end
        end
      end

      puts "Resumo: criados=#{total_criados}, existentes=#{total_existentes}"
    end

    desc 'Purge catálogo de características criado pela tarefa seed'
    task purge: :environment do
      categorias = [:comodos, :infraestrutura, :piso, :posicao, :proximidades]
      afetados = Caracteristica.where(tipo_caracteristica: :comum, categoria: categorias)
      count = afetados.delete_all
      puts "Removidos #{count} registros do catálogo (tipo: comum, categorias: #{categorias.join(', ')})"
    end
  end
end