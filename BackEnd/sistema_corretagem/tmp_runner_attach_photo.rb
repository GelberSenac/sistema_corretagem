# tmp_runner_attach_photo.rb
# Anexa uma imagem de teste a um Imovel e imprime as URLs completas

require_relative 'config/environment'

# Garantir opções de URL completas
Rails.application.routes.default_url_options = {
  host: 'localhost',
  protocol: 'http',
  port: 3001
}

include Rails.application.routes.url_helpers

begin
  u = Usuario.find_by(login: 'admin') || Usuario.first
  raise "Nenhum usuário encontrado" unless u

  imovel = Imovel.first
  unless imovel
    imovel = Imovel.create!(
      usuario_id: u.id,
      nome_empreendimento: 'Teste Upload',
      tipo: :apartamento,
      finalidade: :venda,
      condicao: :usado,
      valor: 100000,
      quartos: 2,
      metragem: 60,
      banheiros: 1,
      vagas_garagem: 1,
      descricao: 'Imóvel de teste para anexar foto via runner'
    )
  end

  path = File.expand_path('test-photo.svg', __dir__)
  unless File.exist?(path)
    File.write(path, '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#4CAF50"/></svg>')
  end

  imovel.photos.attach(io: File.open(path), filename: File.basename(path), content_type: 'image/svg+xml')
  imovel.save!

  puts({ imovel_id: imovel.id, photos_count: imovel.photos.count }.to_json)

  urls = imovel.photos.map { |p| rails_blob_url(p, host: 'localhost', protocol: 'http', port: 3001) }
  puts({ urls: urls }.to_json)
rescue => e
  warn({ error: e.class.name, message: e.message, backtrace: e.backtrace.take(5) }.to_json)
  raise
end